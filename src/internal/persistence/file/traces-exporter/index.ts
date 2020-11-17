import { TracesExporter, TracesExportResult } from "./exporter";
import { CSVTracesExporter } from "./csv-exporter";

export function createTracesExporter(
  folder: string,
  file?: string
): TracesExporter {
  return new CSVTracesExporter(folder, file);
}

export { TracesExporter, TracesExportResult };
