import { Change, RecordType } from "../../../providers/base-record";

export interface SerializedRecord {
  type: RecordType | string;
  timestamp: Date;
  change: Change;
  extraProperties: SerializedProperties;
}

export interface SerializedProperties {
  [key: string]: any;
}
