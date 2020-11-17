export interface TracesExporter {
  export(): Promise<TracesExportResult>;
}

export interface TracesExportResult {
  traceCount: number;
  fileName: string;
}
