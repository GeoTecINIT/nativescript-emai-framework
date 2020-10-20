import { TraceableTask, TracerConfig } from "../tracing";
import { TaskOutcome, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";
import {
  GeofencingStateStore,
  geofencingStateStoreDB,
  NearbyArea,
} from "../../persistence/stores/geofencing/state";
import { GeofencingChecker, GeofencingResult } from "./checker";
import {
  AreasOfInterestStore,
  areasOfInterestStoreDB,
} from "../../persistence/stores/geofencing/aois";
import { Geolocation } from "../../providers/geolocation/geolocation";
import { GeofencingProximity } from "./geofencing-state";
import { AreaOfInterest } from "./aoi";

const DEFAULT_NEARBY_RANGE = 100;

const MOVED_CLOSE = "movedCloseToAreaOfInterest";
const MOVED_INSIDE = "movedInsideAreaOfInterest";
const MOVED_OUTSIDE = "movedOutsideAreaOfInterest";
const MOVED_AWAY = "movedAwayFromAreaOfInterest";

export class GeofencingTask extends TraceableTask {
  constructor(
    name: string,
    taskConfig: TracerConfig = {},
    private state: GeofencingStateStore = geofencingStateStoreDB,
    private checker = new GeofencingChecker(),
    private aois: AreasOfInterestStore = areasOfInterestStoreDB
  ) {
    super(name, {
      ...taskConfig,
      outputEventNames: [
        `${name}Finished`,
        MOVED_CLOSE,
        MOVED_INSIDE,
        MOVED_OUTSIDE,
        MOVED_AWAY,
      ],
    });
  }

  protected async onTracedRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<TaskOutcome> {
    const nearbyAreas = await this.queryNearbyAreasWith(
      invocationEvent,
      taskParams
    );

    if (nearbyAreas.length === 0) {
      return this.handleNoNearbyAreasLeft();
    }

    return this.handleNearbyAreas(nearbyAreas);
  }

  private queryNearbyAreasWith(
    invocationEvent: DispatchableEvent,
    taskParams: TaskParams
  ): Promise<Array<GeofencingResult>> {
    const nearbyRange = taskParams.nearbyRange
      ? taskParams.nearbyRange
      : DEFAULT_NEARBY_RANGE;
    const evtData = invocationEvent.data;

    if (Array.isArray(evtData)) {
      return this.checker.findNearbyTrajectory(
        evtData as Array<Geolocation>,
        nearbyRange
      );
    }
    return this.checker.findNearby(evtData as Geolocation, nearbyRange);
  }

  private async handleNoNearbyAreasLeft(): Promise<TaskOutcome> {
    const knownNearbyAreas = await this.state.getKnownNearbyAreas();
    if (knownNearbyAreas.length === 0) {
      return { eventName: this.outputEventNames[0] };
    }
    const knownInsideAreas = filterInside(knownNearbyAreas);
    const knownCloseAreas = filterNearby(knownNearbyAreas);

    if (knownInsideAreas.length === 0) {
      await this.updateProximityState(
        knownCloseAreas,
        GeofencingProximity.OUTSIDE
      );
      const aois = await this.getRelatedAoIs(knownCloseAreas);
      return { eventName: MOVED_AWAY, result: aois };
    }

    // First, notify the transition to moved outside, so in the invocation it can
    // jointly notify (along with the areas know to be nearby) as "moved away".
    await this.updateProximityState(
      knownInsideAreas,
      GeofencingProximity.NEARBY
    );
    const aois = await this.getRelatedAoIs(knownInsideAreas);
    return { eventName: MOVED_OUTSIDE, result: aois };
  }

  private async handleNearbyAreas(
    nearbyAreas: Array<GeofencingResult>
  ): Promise<TaskOutcome> {
    const insideAreas = filterInside(nearbyAreas);
    const closeAreas = filterNearby(nearbyAreas);

    if (insideAreas.length === 0) {
      const [
        changedFromInsideAreas,
        changedFromOutsideAreas,
      ] = await this.splitChangedFromNearby(closeAreas);

      if (
        changedFromInsideAreas.length === 0 &&
        changedFromOutsideAreas.length === 0
      ) {
        // Nothing changed, report nothing
        return { eventName: this.outputEventNames[0] };
      }

      if (changedFromInsideAreas.length === 0) {
        const aois = changedFromOutsideAreas.map((area) => area.aoi);
        await this.updateProximityState(aois, GeofencingProximity.NEARBY);
        return { eventName: MOVED_CLOSE, result: aois };
      }

      // A transition from inside to outside has priority over an away to nearby transition
      const aois = changedFromInsideAreas.map((area) => area.aoi);
      await this.updateProximityState(aois, GeofencingProximity.NEARBY);
      return { eventName: MOVED_OUTSIDE, result: aois };
    }

    const changedAreas = await this.filterChangedToInside(insideAreas);
    const aois = changedAreas.map((area) => area.aoi);
    await this.updateProximityState(aois, GeofencingProximity.INSIDE);

    if (changedAreas.length === 0) {
      // Do not disturb with other changes while inside
      return { eventName: this.outputEventNames[0] };
    }
    return { eventName: MOVED_INSIDE, result: aois };
  }

  private async updateProximityState(
    identifiables: Array<Identifiable>,
    newProximity: GeofencingProximity
  ): Promise<void> {
    await Promise.all(
      identifiables.map((identifiable) =>
        this.state.updateProximity(identifiable.id, newProximity)
      )
    );
  }

  private async getRelatedAoIs(
    areas: Array<NearbyArea>
  ): Promise<Array<AreaOfInterest>> {
    const ids = areas.map((area) => area.id);
    const aois = await this.aois.getAll();
    return aois.filter((aoi) => ids.indexOf(aoi.id) !== -1);
  }

  private async splitChangedFromNearby(
    checkResults: Array<GeofencingResult>
  ): Promise<[Array<GeofencingResult>, Array<GeofencingResult>]> {
    const changedFromInsideAreas: Array<GeofencingResult> = [];
    const changedFromOutsideAreas: Array<GeofencingResult> = [];
    for (let result of checkResults) {
      const proximity = await this.state.getProximity(result.aoi.id);
      if (proximity === GeofencingProximity.INSIDE) {
        changedFromInsideAreas.push(result);
      }
      if (proximity === GeofencingProximity.OUTSIDE) {
        changedFromOutsideAreas.push(result);
      }
    }
    return [changedFromInsideAreas, changedFromOutsideAreas];
  }

  private async filterChangedToInside(
    checkResults: Array<GeofencingResult>
  ): Promise<Array<GeofencingResult>> {
    const changedOnes: Array<GeofencingResult> = [];
    for (let result of checkResults) {
      const proximity = await this.state.getProximity(result.aoi.id);
      if (proximity !== GeofencingProximity.INSIDE) {
        changedOnes.push(result);
      }
    }
    return changedOnes;
  }
}

function filterInside<T extends Approachable>(
  approachables: Array<T>
): Array<T> {
  return filterByProximity(approachables, GeofencingProximity.INSIDE);
}

function filterNearby<T extends Approachable>(
  approachables: Array<T>
): Array<T> {
  return filterByProximity(approachables, GeofencingProximity.NEARBY);
}

function filterByProximity<T extends Approachable>(
  approachables: Array<T>,
  proximity: GeofencingProximity
): Array<T> {
  return approachables.filter(
    (approachable) => approachable.proximity === proximity
  );
}

interface Identifiable {
  id: string;
}

interface Approachable {
  proximity: GeofencingProximity;
}
