import { Trace } from "../../../tasks/tracing";
import { Observable } from "rxjs";
import { tracesModel } from "./model";
import { pluginDB } from "../db";
import { InanoSQLObserverQuery } from "@nano-sql/core/lib/interfaces";

export interface TracesStore {
  insert(trace: Trace): Promise<void>;
  list(size?: number): Observable<Array<Trace>>;
  getAll(): Promise<Array<Trace>>;
  clear(): Promise<void>;
}

class TracesStoreDB implements TracesStore {
  private tableName = tracesModel.name;

  async insert(trace: Trace): Promise<void> {
    const row = rowFrom(trace);

    const instance = await this.db();
    await instance.query("upsert", row).exec();
  }

  list(size = 100): Observable<Array<Trace>> {
    return new Observable<Array<Trace>>((subscriber) => {
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
              const traces = rows.map((row) => traceFrom(row));
              subscriber.next(traces);
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

  async getAll(): Promise<Array<Trace>> {
    const instance = await this.db();
    const rows = await instance
      .query("select")
      .orderBy(["timestamp ASC"])
      .exec();
    return rows.map((row) => traceFrom(row));
  }
  async clear(): Promise<void> {
    const instance = await this.db();
    await instance.query("delete").exec();
  }

  private db(tableName = this.tableName) {
    return pluginDB.instance(tableName);
  }
}

function rowFrom(trace: Trace): any {
  const { timestamp, id, type, name, result, content } = trace;
  return {
    timestamp: timestamp.getTime(),
    traceId: id,
    type,
    name,
    result,
    content,
  };
}

function traceFrom(row: any): Trace {
  const { timestamp, traceId, type, name, result, content } = row;
  return {
    timestamp: new Date(timestamp),
    id: traceId,
    type,
    name,
    result,
    content,
  };
}

export const tracesStoreDB = new TracesStoreDB();
