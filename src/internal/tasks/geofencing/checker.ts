import {
  AreasOfInterestStore,
  areasOfInterestStoreDB,
} from "../../persistence/stores/geofencing/aois";
import { AreaOfInterest } from "./aoi";
import { GeofencingProximity } from "./geofencing-state";
import { Geolocation } from "../../providers/geolocation/geolocation";
import { point } from "@turf/helpers";
import { default as distance } from "@turf/distance";

export class GeofencingChecker {
  constructor(private store: AreasOfInterestStore = areasOfInterestStoreDB) {}

  async findNearby(
    location: Geolocation,
    nearbyRange: number
  ): Promise<Array<GeofencingResult>> {
    const aois = await this.store.getAll();
    const results = aois.map((aoi) => ({
      aoi,
      proximity: GeofencingChecker.calculateProximity(
        location,
        aoi,
        nearbyRange
      ),
    }));

    return results.filter(
      (result) => result.proximity !== GeofencingProximity.OUTSIDE
    );
  }

  async findNearbyTrajectory(
    locations: Array<Geolocation>,
    nearbyRange: number
  ): Promise<Array<GeofencingResult>> {
    if (locations.length === 0) {
      return [];
    }

    const sometimeNearby: Array<Array<GeofencingResult>> = [];
    for (let location of locations) {
      const nearby = await this.findNearby(location, nearbyRange);
      sometimeNearby.push(nearby);
    }
    if (sometimeNearby.every((result) => result.length === 0)) {
      return [];
    }

    const proximityDict = GeofencingChecker.createProximityDict(sometimeNearby);
    const results: Array<GeofencingResult> = [];
    for (let [aoi, nearness] of proximityDict) {
      const proximity = GeofencingChecker.pickBestProximity(nearness);
      if (proximity !== GeofencingProximity.OUTSIDE) {
        results.push({ aoi, proximity });
      }
    }
    return results;
  }

  private static calculateProximity(
    location: Geolocation,
    aoi: AreaOfInterest,
    distanceOffset: number
  ): GeofencingProximity {
    const loc = point([location.longitude, location.latitude]);
    const aoiCentroid = point([aoi.longitude, aoi.latitude]);
    const dst = distance(loc, aoiCentroid, { units: "kilometers" }) * 1000;

    if (dst <= aoi.radius) {
      return GeofencingProximity.INSIDE;
    }
    if (dst <= aoi.radius + distanceOffset) {
      return GeofencingProximity.NEARBY;
    }
    return GeofencingProximity.OUTSIDE;
  }

  private static createProximityDict(
    sometimeNearby: Array<Array<GeofencingResult>>
  ): Map<AreaOfInterest, Array<GeofencingProximity>> {
    const nearnessAlongTime = new Map<
      AreaOfInterest,
      Array<GeofencingProximity>
    >();

    for (let results of sometimeNearby) {
      for (let result of results) {
        if (!nearnessAlongTime.has(result.aoi)) {
          nearnessAlongTime.set(
            result.aoi,
            GeofencingChecker.createProximityArray(sometimeNearby.length)
          );
        }
      }
    }

    for (let i = 0; i < sometimeNearby.length; i++) {
      for (let result of sometimeNearby[i]) {
        const nearness = nearnessAlongTime.get(result.aoi);
        nearness[i] = result.proximity;
        nearnessAlongTime.set(result.aoi, nearness);
      }
    }

    return nearnessAlongTime;
  }

  private static pickBestProximity(
    nearness: Array<GeofencingProximity>
  ): GeofencingProximity {
    const choices = {};
    choices[GeofencingProximity.INSIDE] = 0;
    choices[GeofencingProximity.NEARBY] = 0;
    choices[GeofencingProximity.OUTSIDE] = 0;

    for (let proximity of nearness) {
      choices[proximity]++;
    }

    let maxValue = choices[GeofencingProximity.INSIDE];
    let bestProximity = GeofencingProximity.INSIDE;
    if (choices[GeofencingProximity.NEARBY] > maxValue) {
      maxValue = choices[GeofencingProximity.NEARBY];
      bestProximity = GeofencingProximity.NEARBY;
    }
    if (choices[GeofencingProximity.OUTSIDE] > maxValue) {
      bestProximity = GeofencingProximity.OUTSIDE;
    }

    if (bestProximity === nearness[nearness.length - 1]) {
      return bestProximity;
    }

    const last = nearness[nearness.length - 1];
    let consecutivePlaces = 1;
    for (let i = nearness.length - 2; i >= 0; i--) {
      if (nearness[i] !== last) {
        break;
      }
      consecutivePlaces++;
    }

    const oneThird = Math.round(nearness.length * (1 / 3));
    if (consecutivePlaces >= oneThird) {
      // At least the last third equals the last proximity;
      return last;
    }

    // Last position is likely to be an outlier, return best proximity instead
    return bestProximity;
  }

  private static createProximityArray(length: number) {
    return Array.from({ length }, () => GeofencingProximity.OUTSIDE);
  }
}

export interface GeofencingResult {
  aoi: AreaOfInterest;
  proximity: GeofencingProximity;
}
