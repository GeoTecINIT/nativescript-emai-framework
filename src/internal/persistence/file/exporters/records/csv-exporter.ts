import { CSVExporter } from "../csv-exporter";

import { Record } from "../../../../providers/base-record";
import { RecordsStore, recordsStoreDB } from "../../../stores/records";
import { RecordSerializerFactory } from "../../../serializers/record/factory";

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
    const serializer = RecordSerializerFactory.createSerializer(record.type);
    const serializedRecord = serializer.serialize(record);
    return [
      serializedRecord.timestamp.getTime(),
      serializedRecord.type,
      serializedRecord.change,
      JSON.stringify(serializedRecord.extraProperties),
    ];
  }
}
