import { Record } from "../../../providers";
import { Observable } from "rxjs";
import { EMAIStore } from "../emai-store";
import {
  deserialize,
  serialize,
} from "nativescript-task-dispatcher/internal/utils/serialization";
import { QueryLogicalOperator } from "../db";
import { LocalTimeSeriesStore } from "./common";

const DOC_TYPE = "record";

class RecordsStoreDB implements LocalTimeSeriesStore<Record> {
  private readonly store: EMAIStore<DBRecord>;

  constructor() {
    this.store = new EMAIStore<DBRecord>(DOC_TYPE, docFrom, dbRecordFrom);
  }

  async insert(record: Record, synchronized = false): Promise<void> {
    const dbRecord = { ...record, synchronized };
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

  async getNotSynchronized(): Promise<Array<Record>> {
    const dbRecords = await this.store.fetch({
      select: [],
      where: [{ property: "synchronized", comparison: "is", value: false }],
      order: [{ property: "timestamp", direction: "asc" }],
    });
    return dbRecords.map(recordFrom);
  }

  async markAsSynchronized(record: Record): Promise<void> {
    const dbRecord = await this.getDBRecordFrom(record);
    if (!dbRecord) {
      return;
    }

    await this.store.update(dbRecord.id, { synchronized: true });
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  private async getDBRecordFrom(record: Record): Promise<DBRecord> {
    const { timestamp, type, change, ...extraProperties } = record;

    const dbRecords = await this.store.fetch({
      select: [],
      where: [
        {
          property: "timestamp",
          comparison: "equalTo",
          value: timestamp.getTime(),
        },
        {
          logical: QueryLogicalOperator.AND,
          property: "type",
          comparison: "equalTo",
          value: type,
        },
        {
          logical: QueryLogicalOperator.AND,
          property: "change",
          comparison: "equalTo",
          value: change,
        },
        {
          logical: QueryLogicalOperator.AND,
          property: "serializedProperties",
          comparison: "equalTo",
          value: serialize(extraProperties),
        },
        {
          logical: QueryLogicalOperator.AND,
          property: "synchronized",
          comparison: "is",
          value: false,
        },
      ],
    });

    if (dbRecords.length === 0) {
      return null;
    }
    return dbRecords[0];
  }
}

function recordFrom(dbRecord: DBRecord): Record {
  const { synchronized, id, ...recordProps } = dbRecord;
  return recordProps;
}

interface DBRecord extends Record {
  id?: string;
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
  const {
    id,
    timestamp,
    type,
    change,
    synchronized,
    serializedProperties,
  } = doc;
  const dbRecord = {
    ...deserialize(serializedProperties),
    id,
    timestamp: new Date(timestamp),
    type,
    change,
    synchronized,
  };

  return dbRecord as DBRecord;
}

export const localRecordsStore = new RecordsStoreDB();
