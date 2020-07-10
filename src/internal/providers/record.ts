import { RecordType } from "./record-type";

export abstract class Record {
  protected constructor(
    public type: RecordType,
    public startsAt = new Date(),
    public endsAt = new Date()
  ) {}
}
