import {
  LocalTimeSeriesStore,
  TimeSeriesRecord,
  TimeSeriesStore,
} from "./common";
import { Observable } from "rxjs";
import { getLogger, Logger } from "../../../utils/logger";

export class TimeSeriesSyncedStore<T extends TimeSeriesRecord>
  implements TimeSeriesStore<T> {
  private externalStore?: TimeSeriesStore<T>;
  private logger: Logger;

  constructor(name: string, private localStore: LocalTimeSeriesStore<T>) {
    this.logger = getLogger(name);
  }

  setExternalStore(store: TimeSeriesStore<T>) {
    this.externalStore = store;
  }

  async insert(record: T): Promise<void> {
    let synchronized = await this.storeRemotely(record);
    await this.localStore.insert(record, synchronized);
  }

  async sync(): Promise<void> {
    if (!this.externalStore) {
      return;
    }

    const unsyncedRecords = await this.localStore.getNotSynchronized();
    if (unsyncedRecords.length === 0) {
      return;
    }

    for (let record of unsyncedRecords) {
      const synced = await this.storeRemotely(record);
      if (synced) {
        await this.localStore.markAsSynchronized(record);
      }
    }
  }

  getAll(): Promise<Array<T>> {
    return this.localStore.getAll();
  }

  list(size?: number): Observable<Array<T>> {
    return this.localStore.list(size);
  }

  clear(): Promise<void> {
    return this.localStore.clear();
  }

  private async storeRemotely(record: T): Promise<boolean> {
    if (!this.externalStore) {
      return false;
    }

    try {
      await this.externalStore.insert(record);
      return true;
    } catch (e) {
      this.logger.warn(`Could not store data remotely: ${e}`);
      return false;
    }
  }
}
