import { CSVExporter } from "../csv-exporter";

import { Record } from "../../../../providers/base-record";
import { RecordsStore, recordsStoreDB } from "../../../stores/records";
import { toTimestampWithTimezoneOffset, jsonDateReplacer } from "../../../../utils/date";

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
    return ["timestamp", "timezoneOffset", "type", "change", "extra_properties"];
  }

  protected formatRow(record: Record): Array<number | string | boolean> {
    const { timestamp, type, change, ...extraProperties } = record;
    const { value, offset } = toTimestampWithTimezoneOffset(timestamp);
    return [
      value,
      offset,
      type,
      change,
      JSON.stringify(extraProperties, jsonDateReplacer),
    ];
  }
}
