import { Observable } from "rxjs";

export interface TimeSeriesRecord {
  timestamp: Date;
}

export interface TimeSeriesStore<T extends TimeSeriesRecord> {
  insert(record: T): Promise<void>;
  list(size?: number): Observable<Array<T>>;
  getAll(): Promise<Array<T>>;
  clear(): Promise<void>;
}

export interface LocalTimeSeriesStore<T extends TimeSeriesRecord>
  extends TimeSeriesStore<T> {
  insert(record: T, synchronized?: boolean): Promise<void>;
  getNotSynchronized(): Promise<Array<T>>;
  markAsSynchronized(record: T): Promise<void>;
  clearOld(minAgeHours: number): Promise<void>;
}
