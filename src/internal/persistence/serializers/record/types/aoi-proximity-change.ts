import { RecordSerializer } from "../record-serializer";
import { AoIProximityChange } from "../../../../tasks/geofencing/aoi";
import { SerializedRecord } from "../serialized-record";

export class AoiProximityChangeSerializer
  implements RecordSerializer<AoIProximityChange> {
  serialize(record: AoIProximityChange): SerializedRecord {
    const { type, timestamp, change, aoi, proximity } = record;
    const extraProperties = {
      aoi,
      proximity,
    };

    return {
      type,
      timestamp,
      change,
      extraProperties,
    };
  }

  deserialize(serializedRecord: SerializedRecord): AoIProximityChange {
    const { extraProperties, change, timestamp } = serializedRecord;
    const { aoi, proximity } = extraProperties;
    return new AoIProximityChange(aoi, proximity, change, timestamp);
  }
}
