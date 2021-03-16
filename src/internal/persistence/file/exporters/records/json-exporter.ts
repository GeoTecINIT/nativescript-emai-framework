import { JSONExporter } from "../json-exporter";

import { Record } from "../../../../providers";
import {
  RecordsStore,
  syncedRecordsStore,
} from "../../../stores/timeseries";

export class JSONRecordsExporter extends JSONExporter<Record> {
  constructor(
    folder: string,
    file?: string,
    private recordsStore: RecordsStore = syncedRecordsStore
  ) {
    super(folder, file);
  }

  protected getItemsToExport(): Promise<Array<Record>> {
    return this.recordsStore.getAll();
  }
}
