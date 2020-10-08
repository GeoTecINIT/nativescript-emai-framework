import { TraceableTask, TracerConfig } from "../tracing";
import { TaskOutcome, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";
import {
  GeofencingStateStore,
  geofencingStateStoreDB,
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
    const nearbyRange = taskParams.nearbyRange
      ? taskParams.nearbyRange
      : DEFAULT_NEARBY_RANGE;
    const nearbyAreas = await this.checker.findNearby(
      invocationEvent.data as Geolocation,
      nearbyRange
    );
    if (nearbyAreas.length === 0) {
      return this.handleNoNearbyAreasLeft();
    }
    return this.handleNearbyAreas(nearbyAreas);
  }

  private async handleNoNearbyAreasLeft(): Promise<TaskOutcome> {
    const knownNearbyAreas = await this.state.getKnownNearbyAreas();
    if (knownNearbyAreas.length === 0) {
      return { eventName: this.outputEventNames[0] };
    }
    const knownInsideAreas = knownNearbyAreas.filter(
      (area) => area.proximity === GeofencingProximity.INSIDE
    );
    const knownCloseAreas = knownNearbyAreas.filter(
      (area) => area.proximity === GeofencingProximity.NEARBY
    );
    if (knownInsideAreas.length === 0) {
      await Promise.all(
        knownCloseAreas.map((area) =>
          this.state.updateProximity(area.id, GeofencingProximity.OUTSIDE)
        )
      );
      const aois = await this.getAreasByIds(
        knownCloseAreas.map((area) => area.id)
      );
      return { eventName: MOVED_AWAY, result: aois };
    }
    await Promise.all(
      knownInsideAreas.map((area) =>
        this.state.updateProximity(area.id, GeofencingProximity.NEARBY)
      )
    );
    const aois = await this.getAreasByIds(
      knownInsideAreas.map((area) => area.id)
    );
    return { eventName: MOVED_OUTSIDE, result: aois };
  }

  private async handleNearbyAreas(
    nearbyAreas: Array<GeofencingResult>
  ): Promise<TaskOutcome> {
    const insideAreas = nearbyAreas.filter(
      (area) => area.proximity === GeofencingProximity.INSIDE
    );
    const closeAreas = nearbyAreas.filter(
      (area) => area.proximity === GeofencingProximity.NEARBY
    );
    if (insideAreas.length === 0) {
      const changedFromInsideAreas = [];
      const changedFromOutsideAreas = [];
      for (let area of closeAreas) {
        const proximity = await this.state.getProximity(area.aoi.id);
        if (proximity === GeofencingProximity.INSIDE) {
          changedFromInsideAreas.push(area);
        }
        if (proximity === GeofencingProximity.OUTSIDE) {
          changedFromOutsideAreas.push(area);
        }
      }
      if (
        changedFromInsideAreas.length === 0 &&
        changedFromOutsideAreas.length === 0
      ) {
        return { eventName: this.outputEventNames[0] };
      }
      if (changedFromInsideAreas.length === 0) {
        for (let area of changedFromOutsideAreas) {
          await this.state.updateProximity(
            area.aoi.id,
            GeofencingProximity.NEARBY
          );
        }
        return {
          eventName: MOVED_CLOSE,
          result: changedFromOutsideAreas.map((area) => area.aoi),
        };
      }
      for (let area of changedFromInsideAreas) {
        await this.state.updateProximity(
          area.aoi.id,
          GeofencingProximity.NEARBY
        );
      }
      return {
        eventName: MOVED_OUTSIDE,
        result: changedFromInsideAreas.map((area) => area.aoi),
      };
    }
    const changedAreas = [];
    for (let area of insideAreas) {
      const proximity = await this.state.getProximity(area.aoi.id);
      if (proximity !== GeofencingProximity.INSIDE) {
        await this.state.updateProximity(
          area.aoi.id,
          GeofencingProximity.INSIDE
        );
        changedAreas.push(area);
      }
    }
    if (changedAreas.length === 0) {
      return { eventName: this.outputEventNames[0] };
    }
    return {
      eventName: MOVED_INSIDE,
      result: changedAreas.map((area) => area.aoi),
    };
  }

  private async getAreasByIds(
    ids: Array<string>
  ): Promise<Array<AreaOfInterest>> {
    const aois = await this.aois.getAll();
    return aois.filter((aoi) => ids.indexOf(aoi.id) !== -1);
  }
}
