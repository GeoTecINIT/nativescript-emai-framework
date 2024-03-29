import {
  LocalTimeSeriesStore,
  TimeSeriesEntity,
  TimeSeriesStore,
} from "./common";
import { Observable } from "rxjs";
import { getLogger, Logger } from "../../../utils/logger";

export class TimeSeriesSyncedStore<T extends TimeSeriesEntity>
  implements TimeSeriesStore<T> {
  private externalStore?: TimeSeriesStore<T>;
  private clearOldThreshold = -1;
  private logger: Logger;

  constructor(name: string, private localStore: LocalTimeSeriesStore<T>) {
    this.logger = getLogger(name);
  }

  setExternalStore(store: TimeSeriesStore<T>) {
    if (store === this.localStore) {
      throw new Error(
        "You cannot use a local store as an external store... (¬_¬ )"
      );
    }
    this.externalStore = store;
  }

  setClearOldThreshold(minAgeHours: number) {
    if (minAgeHours <= 0) {
      throw Error("Old data cleaning threshold must be higher than 0");
    }
    this.clearOldThreshold = minAgeHours;
  }

  async insert(entity: T): Promise<void> {
    let synchronized = await this.storeRemotely(entity);
    await this.localStore.insert(entity, synchronized);
  }

  async sync(): Promise<void> {
    if (!this.externalStore) {
      return;
    }

    const unsyncedEntities = await this.localStore.getNotSynchronized();
    if (unsyncedEntities.length === 0) {
      return;
    }

    for (let entity of unsyncedEntities) {
      const synced = await this.storeRemotely(entity);
      if (synced) {
        await this.localStore.markAsSynchronized(entity);
      }
    }
  }

  async clearOld(): Promise<void> {
    if (this.clearOldThreshold === -1) {
      return;
    }
    await this.localStore.clearOld(this.clearOldThreshold);
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

  private async storeRemotely(entity: T): Promise<boolean> {
    if (!this.externalStore) {
      return false;
    }

    try {
      await this.externalStore.insert(entity);
      return true;
    } catch (e) {
      this.logger.warn(
        `Could not store data remotely. Reason: ${JSON.stringify(e)}`
      );
      return false;
    }
  }
}
