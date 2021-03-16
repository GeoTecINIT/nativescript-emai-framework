import { Record } from "../../../providers";
import {
  deserialize,
  serialize,
} from "nativescript-task-dispatcher/internal/utils/serialization";
import { AbstractTimeSeriesStore } from "./common";

const DOC_TYPE = "record";

class RecordsStoreDB extends AbstractTimeSeriesStore<Record> {
  constructor() {
    super(DOC_TYPE, docFrom, recordFrom);
  }
}

function docFrom(record: Record): any {
  const { timestamp, type, change, ...extraProperties } = record;
  const serializedProperties = serialize(extraProperties);

  return {
    timestamp: timestamp.getTime(),
    type,
    change,
    serializedProperties,
  };
}

function recordFrom(doc: any): Record {
  const { timestamp, type, change, serializedProperties } = doc;
  const dbRecord = {
    ...deserialize(serializedProperties),
    timestamp: new Date(timestamp),
    type,
    change,
  };

  return dbRecord as Record;
}

export const localRecordsStore = new RecordsStoreDB();
