import { TimeSeriesSyncedStore } from "./synchronizer";
import { localRecordsStore } from "./records";
import { TimeSeriesStore } from "./common";
import { Record } from "../../../providers";

export interface RecordsStore extends TimeSeriesStore<Record> {}

export const syncedRecordsStore = new TimeSeriesSyncedStore(
  "RecordsStore",
  localRecordsStore
);
