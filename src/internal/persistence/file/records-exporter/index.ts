import { RecordsExporter, RecordsExportResult } from "./exporter";
import { CSVRecordsExporter } from "./csv-exporter";
import { JSONRecordsExporter } from "./json-exporter";

export function createRecordsExporter(
  folder: string,
  file?: string,
  format: "csv" | "json" = "csv"
): RecordsExporter {
  switch (format) {
    case "csv":
      return new CSVRecordsExporter(folder, file);
    case "json":
      return new JSONRecordsExporter(folder, file);
  }
}

export { RecordsExporter, RecordsExportResult };
