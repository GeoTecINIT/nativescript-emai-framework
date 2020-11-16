import { RecordSerializer } from "../record-serializer";
import {
  HumanActivity,
  HumanActivityChange,
} from "../../../../providers/activity-recognition/human-activity-change";
import { SerializedRecord, SerializedProperties } from "../serialized-record";

export class HumanActivityChangeSerializer
  implements RecordSerializer<HumanActivityChange> {
  serialize(record: HumanActivityChange): SerializedRecord {
    const { type, timestamp, change, activity, confidence } = record;
    const extraProperties: HumanActivityChangeProps = {
      activity,
      confidence,
    };

    return {
      type,
      timestamp,
      change,
      extraProperties,
    };
  }

  deserialize(serializedRecord: SerializedRecord): HumanActivityChange {
    const { timestamp, change } = serializedRecord;
    const extraProperties = serializedRecord.extraProperties as HumanActivityChangeProps;
    const { activity, confidence } = extraProperties;

    return new HumanActivityChange(
      activity,
      change,
      timestamp,
      confidence ? confidence : undefined
    );
  }
}

interface HumanActivityChangeProps extends SerializedProperties {
  activity: HumanActivity;
  confidence: number;
}
