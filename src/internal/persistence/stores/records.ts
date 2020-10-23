import { Record } from "../../providers/base-record";
import { Observable, Subject } from "rxjs";
import { Couchbase, QueryMeta } from "nativescript-couchbase-plugin";
import { RecordSerializerFactory } from "../serializers/record/factory";

export interface RecordsStore {
  insert(record: Record): Promise<void>;
  list(size?: number): Observable<Array<Record>>;
  getAll(): Promise<Array<Record>>;
  clear(): Promise<void>;
}

const DB_NAME = "emai-records";

class RecordsStoreDB implements RecordsStore {
  private readonly database: Couchbase;
  private readonly changes: Subject<Array<string>>;

  constructor() {
    this.database = new Couchbase(DB_NAME);
    this.changes = new Subject<Array<string>>();
  }

  async insert(record: Record): Promise<void> {
    const doc = docFrom(record);
    const id = this.database.createDocument(doc);
    this.changes.next([id]);
  }

  list(size = 100): Observable<Array<Record>> {
    return new Observable<Array<Record>>((subscriber) => {
      const subscription = this.changes.subscribe(() => {
        this.getAllFromNewToOld(size)
          .then((records) => {
            subscriber.next(records);
          })
          .catch((err) => {
            subscriber.error(err);
          });
      });

      this.getAllFromNewToOld(size)
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

  async getAll(): Promise<Array<Record>> {
    const docs = this.database.query({
      select: [],
      order: [{ property: "timestamp", direction: "asc" }],
    });
    return docs.map((doc) => recordFrom(doc));
  }

  private async getAllFromNewToOld(size: number): Promise<Array<Record>> {
    const docs = this.database.query({
      select: [],
      order: [{ property: "timestamp", direction: "desc" }],
      limit: size,
    });
    return docs.map((doc) => recordFrom(doc));
  }

  clear(): Promise<void> {
    return new Promise((resolve) => {
      this.database.inBatch(() => {
        const docs = this.database.query({ select: [QueryMeta.ID] });
        const ids: Array<string> = [];
        for (let doc of docs) {
          const id = doc.id;
          this.database.deleteDocument(id);
          ids.push(id);
        }
        this.changes.next(ids);
        resolve();
      });
    });
  }
}

function docFrom(record: Record): any {
  const serializer = RecordSerializerFactory.createSerializer(record.type);
  const serializedRecord = serializer.serialize(record);

  return {
    ...serializedRecord,
    timestamp: serializedRecord.timestamp.getTime(),
  };
}

function recordFrom(doc: any): Record {
  const serializedRecord = {
    type: doc.type,
    timestamp: new Date(doc.timestamp),
    change: doc.change,
    extraProperties: doc.extraProperties,
  };

  const serializer = RecordSerializerFactory.createSerializer(
    serializedRecord.type
  );
  return serializer.deserialize(serializedRecord);
}

export const recordsStoreDB = new RecordsStoreDB();
