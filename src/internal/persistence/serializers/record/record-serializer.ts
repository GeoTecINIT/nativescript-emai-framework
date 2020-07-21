import { Record } from "../../../providers/base-record";
import { SerializedRecord } from "./serialized-record";

export interface RecordSerializer<T extends Record> {
  serialize(record: T): SerializedRecord;
  deserialize(serializedRecord: SerializedRecord): T;
}
