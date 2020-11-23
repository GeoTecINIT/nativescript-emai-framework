import { JSONExporter } from "../json-exporter";

import { Record } from "../../../../providers/base-record";
import { RecordsStore, recordsStoreDB } from "../../../stores/records";

export class JSONRecordsExporter extends JSONExporter<Record> {
  constructor(
    folder: string,
    file?: string,
    private recordsStore: RecordsStore = recordsStoreDB
  ) {
    super(folder, file);
  }

  protected getItemsToExport(): Promise<Array<Record>> {
    return this.recordsStore.getAll();
  }
}
