import { knownFolders, Folder } from "tns-core-modules/file-system";
import { RecordsStore, recordsStoreDB } from "../stores/records";
import { Record } from "../../providers/base-record";
import { RecordSerializerFactory } from "../serializers/record/factory";

const SEPARATOR = ",";

class CSVRecordsExporter {
  private folder: Folder;
  private fileName: string;

  private textToWrite = "";

  constructor(
    folder: string,
    file?: string,
    private recordsStore: RecordsStore = recordsStoreDB
  ) {
    const documents = knownFolders.documents();
    this.folder = documents.getFolder(folder);
    const fileName = file ? file : Date.now().toString();
    this.fileName = `${fileName}.csv`;
  }

  async export(): Promise<RecordsExportResult> {
    const records = await this.recordsStore.getAll();
    this.writeHeaders();
    for (let record of records) {
      this.writeRow(record);
    }
    await this.flush();
    return {
      recordCount: records.length,
      fileName: this.fileName,
    };
  }

  private writeHeaders() {
    const headers = ["timestamp", "type", "change", "extra_properties"];
    this.writeLine(headers.join(SEPARATOR));
  }

  private writeRow(record: Record) {
    const serializer = RecordSerializerFactory.createSerializer(record.type);
    const serializedRecord = serializer.serialize(record);
    const row = [
      serializedRecord.timestamp.getTime(),
      formatString(serializedRecord.type),
      formatString(serializedRecord.change),
      formatString(JSON.stringify(serializedRecord.extraProperties)),
    ];
    this.writeLine(row.join(SEPARATOR));
  }

  private writeLine(line: string) {
    if (this.textToWrite === "") {
      this.textToWrite = line;
    } else {
      this.textToWrite += `\n${line}`;
    }
  }

  private async flush() {
    const file = this.folder.getFile(this.fileName);
    await file.writeText(this.textToWrite);
    this.textToWrite = "";
  }
}

export function createRecordsExporter(folder: string, file?: string) {
  return new CSVRecordsExporter(folder, file);
}

export interface RecordsExportResult {
  recordCount: number;
  fileName: string;
}

function formatString(str: string) {
  return `"${str.split('"').join('""')}"`;
}
