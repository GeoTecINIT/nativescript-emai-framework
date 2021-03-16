import { JSONExporter } from "../json-exporter";

import { Trace } from "../../../../tasks/tracing";
import { TracesStore, syncedTracesStore } from "../../../stores/timeseries";

export class JSONTracesExporter extends JSONExporter<Trace> {
  constructor(
    folder: string,
    file?: string,
    private tracesStore: TracesStore = syncedTracesStore
  ) {
    super(folder, file);
  }

  protected getItemsToExport(): Promise<Array<Trace>> {
    return this.tracesStore.getAll();
  }
}
