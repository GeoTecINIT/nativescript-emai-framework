import { TracesExporter, TracesExportResult } from "./exporter";

import { Folder, knownFolders } from "tns-core-modules/file-system/file-system";
import { TracesStore, tracesStoreDB } from "../../stores/traces";

export class JSONTracesExporter implements TracesExporter {
  private readonly folder: Folder;
  private readonly fileName: string;

  constructor(
    folder: string,
    file?: string,
    private tracesStore: TracesStore = tracesStoreDB
  ) {
    const documents = knownFolders.documents();
    this.folder = documents.getFolder(folder);
    const fileName = file ? file : Date.now().toString();
    this.fileName = `${fileName}.json`;
  }

  async export(): Promise<TracesExportResult> {
    const traces = await this.tracesStore.getAll();
    const file = this.folder.getFile(this.fileName);
    await file.writeText(JSON.stringify(traces));

    return {
      traceCount: traces.length,
      fileName: this.fileName,
    };
  }
}
