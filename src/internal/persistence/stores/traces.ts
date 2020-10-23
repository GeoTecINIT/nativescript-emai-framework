import { Trace } from "../../tasks/tracing";
import { Couchbase, QueryMeta } from "nativescript-couchbase-plugin";
import { Observable, Subject } from "rxjs";

export interface TracesStore {
  insert(trace: Trace): Promise<void>;
  list(size?: number): Observable<Array<Trace>>;
  getAll(): Promise<Array<Trace>>;
  clear(): Promise<void>;
}

const DB_NAME = "emai-traces";

class TracesStoreDB implements TracesStore {
  private readonly database: Couchbase;
  private readonly changes: Subject<Array<string>>;

  constructor() {
    this.database = new Couchbase(DB_NAME);
    this.changes = new Subject<Array<string>>();
  }

  async insert(trace: Trace): Promise<void> {
    const doc = docFrom(trace);
    const id = this.database.createDocument(doc);
    this.changes.next([id]);
  }

  list(size = 100): Observable<Array<Trace>> {
    return new Observable<Array<Trace>>((subscriber) => {
      const subscription = this.changes.subscribe(() => {
        this.getAllFromNewToOld(size)
          .then((traces) => {
            subscriber.next(traces);
          })
          .catch((err) => subscriber.error(err));
      });
      this.getAllFromNewToOld(size)
        .then((traces) => {
          subscriber.next(traces);
        })
        .catch((err) => subscriber.error(err));

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  async getAll(): Promise<Array<Trace>> {
    const docs = this.database.query({
      select: [],
      order: [{ property: "timestamp", direction: "asc" }],
    });
    return docs.map((doc) => traceFrom(doc));
  }

  clear(): Promise<void> {
    return new Promise((resolve) => {
      this.database.inBatch(() => {
        const docs = this.database.query({
          select: [QueryMeta.ID],
        });
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

  private async getAllFromNewToOld(size: number): Promise<Array<Trace>> {
    const docs = this.database.query({
      select: [],
      order: [{ property: "timestamp", direction: "desc" }],
      limit: size,
    });
    return docs.map((doc) => traceFrom(doc));
  }
}

function docFrom(trace: Trace): any {
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

function traceFrom(doc: any): Trace {
  const { timestamp, traceId, type, name, result, content } = doc;
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
