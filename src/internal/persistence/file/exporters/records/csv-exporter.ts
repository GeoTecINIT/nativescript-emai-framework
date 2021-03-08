import { CSVExporter } from "../csv-exporter";

import { Record } from "../../../../providers/base-record";
import { RecordsStore, recordsStoreDB } from "../../../stores/records";

export class CSVRecordsExporter extends CSVExporter<Record> {
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

  protected formatHeaders(): Array<string> {
    return ["timestamp", "type", "change", "extra_properties"];
  }

  protected formatRow(record: Record): Array<number | string | boolean> {
    const { timestamp, type, change, ...extraProperties } = record;
    return [
      timestamp.getTime(),
      type,
      change,
      JSON.stringify(extraProperties),
    ];
  }
}
