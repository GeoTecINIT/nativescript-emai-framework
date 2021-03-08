import { Record } from "../../providers/base-record";
import { Observable } from "rxjs";
import { EMAIStore } from "./emai-store";

export interface RecordsStore {
  insert(record: Record): Promise<void>;
  list(size?: number): Observable<Array<Record>>;
  getAll(): Promise<Array<Record>>;
  clear(): Promise<void>;
}

const DOC_TYPE = "record";

class RecordsStoreDB implements RecordsStore {
  private readonly store: EMAIStore<Record>;

  constructor() {
    this.store = new EMAIStore<Record>(DOC_TYPE, docFrom, recordFrom);
  }

  async insert(record: Record): Promise<void> {
    await this.store.create(record);
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
    return this.store.fetch({
      select: [],
      order: [
        { property: "timestamp", direction: !reverseOrder ? "asc" : "desc" },
      ],
      limit: limitSize,
    });
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}

function docFrom(record: Record): any {
  const stringifiedRecord = JSON.stringify(record, replacer);

  return {
    stringifiedRecord,
    timestamp: record.timestamp.getTime(),
  };
}

function recordFrom(doc: any): Record {
  const record = JSON.parse(doc.stringifiedRecord, reviver);
  Object.keys(record).forEach(key => {
    if (!record[key]) {
      record[key] = undefined;
    }
  });

  return record as Record;
}

function replacer(key: string, value: any): any {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toUTCString();
  }

  return value;
}

function reviver(key: string, value: any): any {
  if (key === 'timestamp') {
    return new Date(value);
  }

  return value;
}

export const recordsStoreDB = new RecordsStoreDB();
