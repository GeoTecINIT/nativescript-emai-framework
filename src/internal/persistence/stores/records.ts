import { Record } from "../../providers/base-record";
import { Observable } from "rxjs";
import { EMAIStore } from "./emai-store";
import {
  deserialize,
  serialize,
} from "nativescript-task-dispatcher/internal/utils/serialization";

export interface RecordsStore {
  insert(record: Record): Promise<void>;
  list(size?: number): Observable<Array<Record>>;
  getAll(): Promise<Array<Record>>;
  clear(): Promise<void>;
}

const DOC_TYPE = "record";

class RecordsStoreDB implements RecordsStore {
  private readonly store: EMAIStore<DBRecord>;

  constructor() {
    this.store = new EMAIStore<DBRecord>(DOC_TYPE, docFrom, dbRecordFrom);
  }

  async insert(record: Record): Promise<void> {
    const dbRecord = { ...record, synchronized: false };
    await this.store.create(dbRecord);
  }

  list(size = 100): Observable<Array<Record>> {
    return new Observable<Array<Record>>((subscriber) => {
      const subscription = this.store.changes.subscribe(() => {
        this.getAll(true, size)
          .then((records) => {
            subscriber.next(records);
          })
          .catch((err) => {
            subscriber.error(err);
          });
      });

      this.getAll(true, size)
        .then((records) => {
          subscriber.next(records);
        })
        .catch((err) => {
          subscriber.error(err);
        });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  async getAll(
    reverseOrder?: boolean,
    limitSize?: number
  ): Promise<Array<Record>> {
    const dbRecords = await this.store.fetch({
      select: [],
      order: [
        { property: "timestamp", direction: !reverseOrder ? "asc" : "desc" },
      ],
      limit: limitSize,
    });
    return dbRecords.map(recordFrom);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}

function recordFrom(dbRecord: DBRecord): Record {
  const { synchronized, ...recordProps } = dbRecord;
  return recordProps;
}

interface DBRecord extends Record {
  synchronized: boolean;
}

function docFrom(dbRecord: DBRecord): any {
  const {
    timestamp,
    type,
    change,
    synchronized,
    ...extraProperties
  } = dbRecord;
  const serializedProperties = serialize(extraProperties);

  return {
    timestamp: timestamp.getTime(),
    type,
    change,
    synchronized,
    serializedProperties,
  };
}

function dbRecordFrom(doc: any): DBRecord {
  const { timestamp, type, change, synchronized, serializedProperties } = doc;
  const dbRecord = {
    ...deserialize(serializedProperties),
    timestamp: new Date(timestamp),
    type,
    change,
    synchronized,
  };

  return dbRecord as DBRecord;
}

export const recordsStoreDB = new RecordsStoreDB();
