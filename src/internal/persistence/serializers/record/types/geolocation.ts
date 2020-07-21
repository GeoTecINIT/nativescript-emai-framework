import { RecordSerializer } from "../record-serializer";
import { Geolocation } from "../../../../providers/geolocation/geolocation";
import { SerializedProperties, SerializedRecord } from "../serialized-record";

export class GeolocationSerializer implements RecordSerializer<Geolocation> {
  serialize(record: Geolocation): SerializedRecord {
    const {
      type,
      timestamp,
      change,
      latitude,
      longitude,
      altitude,
      horizontalAccuracy,
      verticalAccuracy,
      speed,
      direction,
    } = record;
    const extraProperties: GeolocationProps = {
      latitude,
      longitude,
      altitude,
      horizontalAccuracy,
      verticalAccuracy,
      speed,
      direction,
    };

    return {
      type,
      timestamp,
      change,
      extraProperties,
    };
  }

  deserialize(serializedRecord: SerializedRecord): Geolocation {
    const { timestamp } = serializedRecord;
    const extraProperties = serializedRecord.extraProperties as GeolocationProps;
    const {
      latitude,
      longitude,
      altitude,
      horizontalAccuracy,
      verticalAccuracy,
      speed,
      direction,
    } = extraProperties;

    return new Geolocation(
      latitude,
      longitude,
      altitude,
      horizontalAccuracy,
      verticalAccuracy,
      speed,
      direction,
      timestamp
    );
  }
}

interface GeolocationProps extends SerializedProperties {
  latitude: number;
  longitude: number;
  altitude: number;
  horizontalAccuracy: number;
  verticalAccuracy: number;
  speed: number;
  direction: number;
}
