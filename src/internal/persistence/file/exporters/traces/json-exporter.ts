import { JSONExporter } from "../json-exporter";

import { Trace } from "../../../../tasks/tracing";
import { TracesStore, tracesStoreDB } from "../../../stores/traces";

export class JSONTracesExporter extends JSONExporter<Trace> {
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
}
