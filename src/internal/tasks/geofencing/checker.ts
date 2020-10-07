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
}

export interface GeofencingResult {
  aoi: AreaOfInterest;
  proximity: GeofencingProximity;
}
