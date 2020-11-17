export interface RecordsExporter {
  export(): Promise<RecordsExportResult>;
}

export interface RecordsExportResult {
  recordCount: number;
  fileName: string;
}
