import { CSVExporter } from "../csv-exporter";

import { Trace } from "../../../../tasks/tracing";
import { TracesStore, tracesStoreDB } from "../../../stores/traces";

export class CSVTracesExporter extends CSVExporter<Trace> {
  constructor(
    folder: string,
    file?: string,
    private tracesStore: TracesStore = tracesStoreDB
  ) {
    super(folder, file);
  }

  protected getItemsToExport(): Promise<Array<Trace>> {
    return this.tracesStore.getAll();
  }

  protected formatHeaders(): Array<string> {
    return ["timestamp", "id", "type", "name", "result", "content"];
  }

  protected formatRow(trace: Trace): Array<number | string | boolean> {
    const { timestamp, id, type, name, result, content } = trace;
    return [
      timestamp.getTime(),
      id,
      type,
      name,
      result,
      JSON.stringify(content),
    ];
  }
}
