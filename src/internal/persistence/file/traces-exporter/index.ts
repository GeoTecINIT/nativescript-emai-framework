import { TracesExporter, TracesExportResult } from "./exporter";
import { CSVTracesExporter } from "./csv-exporter";
import { JSONTracesExporter } from "./json-exporter";

export function createTracesExporter(
  folder: string,
  file?: string,
  format: "csv" | "json" = "csv"
): TracesExporter {
  switch (format) {
    case "csv":
      return new CSVTracesExporter(folder, file);
    case "json":
      return new JSONTracesExporter(folder, file);
  }
}

export { TracesExporter, TracesExportResult };
