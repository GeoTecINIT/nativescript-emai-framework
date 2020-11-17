import { RecordsExporter, RecordsExportResult } from "./exporter";
import { RecordsStore, recordsStoreDB } from "../../stores/records";
import { knownFolders, Folder } from "tns-core-modules/file-system";

export class JSONRecordsExporter implements RecordsExporter {
  private readonly folder: Folder;
  private readonly fileName: string;

  constructor(
    folder: string,
    file?: string,
    private recordsStore: RecordsStore = recordsStoreDB
  ) {
    const documents = knownFolders.documents();
    this.folder = documents.getFolder(folder);
    const fileName = file ? file : Date.now().toString();
    this.fileName = `${fileName}.json`;
  }

  async export(): Promise<RecordsExportResult> {
    const records = await this.recordsStore.getAll();
    const file = this.folder.getFile(this.fileName);
    await file.writeText(JSON.stringify(records));

    return {
      recordCount: records.length,
      fileName: this.fileName,
    };
  }
}
