import { Record } from "../../providers/base-record";
import { Observable } from "rxjs";
import { RecordSerializerFactory } from "../serializers/record/factory";
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
