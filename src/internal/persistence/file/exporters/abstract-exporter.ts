import { ExportResult, Exporter } from "./index";
import { Folder, knownFolders } from "tns-core-modules/file-system";

export abstract class AbstractExporter<T> implements Exporter {
  protected readonly folder: Folder;
  protected readonly fileName: string;

  protected constructor(folder: string, fileExtension: string, file?: string) {
    const documents = knownFolders.documents();
    this.folder = documents.getFolder(folder);
    const fileName = file ? file : Date.now().toString();
    this.fileName = `${fileName}.${fileExtension}`;
  }

  abstract export(): Promise<ExportResult>;

  protected abstract getItemsToExport(): Promise<Array<T>>;
}
