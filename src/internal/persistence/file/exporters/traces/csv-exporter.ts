import { CSVExporter } from "../csv-exporter";

import { Trace } from "../../../../tasks/tracing";
import { TracesStore, syncedTracesStore } from "../../../stores/timeseries";
import {
  toTimestampWithTimezoneOffset,
  jsonDateReplacer,
} from "../../../../utils/date";

export class CSVTracesExporter extends CSVExporter<Trace> {
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

  protected formatHeaders(): Array<string> {
    return [
      "timestamp",
      "timezoneOffset",
      "chainId",
      "type",
      "name",
      "result",
      "content",
    ];
  }

  protected formatRow(trace: Trace): Array<number | string | boolean> {
    const { timestamp, chainId, type, name, result, content } = trace;
    const { value, offset } = toTimestampWithTimezoneOffset(timestamp);
    return [
      value,
      offset,
      chainId,
      type,
      name,
      result,
      JSON.stringify(content, jsonDateReplacer),
    ];
  }
}
