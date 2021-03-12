import { AbstractExporter } from "./abstract-exporter";
import { ExportResult } from "./index";
import { jsonDateReplacer } from "../../../utils/date";

export abstract class JSONExporter<T> extends AbstractExporter<T> {
  protected constructor(folder: string, file?: string) {
    super(folder, "json", file);
  }

  async export(): Promise<ExportResult> {
    const items = await this.getItemsToExport();
    const file = this.folder.getFile(this.fileName);
    await file.writeText(JSON.stringify(items, jsonDateReplacer));

    return {
      exportCount: items.length,
      fileName: this.fileName,
    };
  }
}
