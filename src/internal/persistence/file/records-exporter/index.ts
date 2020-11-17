import { RecordsExporter, RecordsExportResult } from "./exporter";
import { CSVRecordsExporter } from "./csv-exporter";

export function createRecordsExporter(
  folder: string,
  file?: string
): RecordsExporter {
  return new CSVRecordsExporter(folder, file);
}

export { RecordsExporter, RecordsExportResult };
