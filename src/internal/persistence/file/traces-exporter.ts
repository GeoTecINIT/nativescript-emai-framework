import { Folder, knownFolders } from "tns-core-modules/file-system";
import { TracesStore, tracesStoreDB } from "../stores/traces";
import { Trace } from "../../tasks/tracing";

const SEPARATOR = ",";

class CSVTracesExporter {
  private folder: Folder;
  private fileName: string;

  private textToWrite = "";

  constructor(
    folder: string,
    file?: string,
    private tracesStore: TracesStore = tracesStoreDB
  ) {
    const documents = knownFolders.documents();
    this.folder = documents.getFolder(folder);
    const fileName = file ? file : Date.now().toString();
    this.fileName = `${fileName}.csv`;
  }

  async export(): Promise<TracesExportResult> {
    const traces = await this.tracesStore.getAll();
    this.writeHeaders();
    for (let trace of traces) {
      this.writeRow(trace);
    }
    await this.flush();
    return {
      traceCount: traces.length,
      fileName: this.fileName,
    };
  }

  private writeHeaders() {
    const headers = ["timestamp", "id", "type", "name", "result", "content"];
    this.writeLine(headers.join(SEPARATOR));
  }

  private writeRow(trace: Trace) {
    const { timestamp, id, type, name, result, content } = trace;
    const row = [
      timestamp.getTime(),
      formatString(id),
      formatString(type),
      formatString(name),
      formatString(result),
      formatString(JSON.stringify(content)),
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

export function createTracesExporter(folder: string, file?: string) {
  return new CSVTracesExporter(folder, file);
}

export interface TracesExportResult {
  traceCount: number;
  fileName: string;
}

function formatString(str: string) {
  return `"${str.split('"').join('""')}"`;
}
