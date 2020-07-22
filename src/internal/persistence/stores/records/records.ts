import { Record } from "../../../providers/base-record";
import { Observable } from "rxjs";
import { recordsModel } from "./model";
import { RecordSerializerFactory } from "../../serializers/record/factory";
import { pluginDB } from "../db";
import { InanoSQLObserverQuery } from "@nano-sql/core/lib/interfaces";
import { SerializedRecord } from "../../serializers/record/serialized-record";

export interface RecordsStore {
  insert(record: Record): Promise<void>;
  list(size?: number): Observable<Array<Record>>;
  getAll(): Promise<Array<Record>>;
  clear(): Promise<void>;
}

class RecordsStoreDB implements RecordsStore {
  private tableName = recordsModel.name;

  async insert(record: Record): Promise<void> {
    const serializer = RecordSerializerFactory.createSerializer(record.type);
    const serializedRecord = serializer.serialize(record);

    const instance = await this.db();
    await instance
      .query("upsert", {
        ...serializedRecord,
        timestamp: serializedRecord.timestamp.getTime(),
      })
      .exec();
  }

  list(size = 100): Observable<Array<Record>> {
    return new Observable<Array<Record>>((subscriber) => {
      let observer: InanoSQLObserverQuery;
      this.db()
        .then((instance) => {
          observer = instance
            .query("select")
            .orderBy(["timestamp DESC"])
            .limit(size)
            .listen();
          observer.exec((rows, err) => {
            if (err) {
              subscriber.error(err);
            } else {
              const serializedRecords = rows.map((row) =>
                serializedRecordFrom(row)
              );
              const records = serializedRecords.map((serializedRecord) =>
                recordFrom(serializedRecord)
              );
              subscriber.next(records);
            }
          });
        })
        .catch((err) => {
          subscriber.error(err);
        });
      return () => {
        if (observer) {
          observer.unsubscribe();
        }
      };
    });
  }

  async getAll(): Promise<Array<Record>> {
    const instance = await this.db();
    const rows = await instance
      .query("select")
      .orderBy(["timestamp ASC"])
      .exec();
    const serializedRecords = rows.map((row) => serializedRecordFrom(row));
    return serializedRecords.map((serializedRecord) =>
      recordFrom(serializedRecord)
    );
  }

  async clear(): Promise<void> {
    const instance = await this.db();
    await instance.query("delete").exec();
  }

  private db(tableName = this.tableName) {
    return pluginDB.instance(tableName);
  }
}

function serializedRecordFrom(row: { [key: string]: any }): SerializedRecord {
  return {
    type: row.type,
    timestamp: new Date(row.timestamp),
    change: row.change,
    extraProperties: row.extraProperties,
  };
}

function recordFrom(serializedRecord: SerializedRecord): Record {
  const serializer = RecordSerializerFactory.createSerializer(
    serializedRecord.type
  );
  return serializer.deserialize(serializedRecord);
}

export const recordsStoreDB = new RecordsStoreDB();
