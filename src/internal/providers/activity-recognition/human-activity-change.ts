import { Record } from "../record";
import { HumanActivity } from "nativescript-context-apis/activity-recognition";
import { Change } from "../change";
import { RecordType } from "../record-type";

export class HumanActivityChange extends Record {
  constructor(
    public activity: HumanActivity,
    change: Change,
    detectedAt: Date,
    public confidence?: number
  ) {
    super(RecordType.HumanActivity, detectedAt, change);
  }
}
