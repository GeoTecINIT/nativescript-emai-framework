import {Change, Record, RecordType} from "../../providers/base-record";
import {GeofencingProximity} from "./geofencing-state";

export class AoIProximityChange extends Record {
  constructor(
    public aoi: AreaOfInterest,
    public proximity: GeofencingProximity,
    change: Change
  ) {
    super(RecordType.AoIProximityChange, new Date(), change);
  }
}

export interface AreaOfInterest {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  category?: string;
  level?: number;
}
