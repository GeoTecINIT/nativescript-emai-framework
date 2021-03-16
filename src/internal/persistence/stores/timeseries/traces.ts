import { Trace } from "../../../tasks/tracing";
import { Observable } from "rxjs";
import { EMAIStore } from "../emai-store";
import {
  deserialize,
  serialize,
} from "nativescript-task-dispatcher/internal/utils/serialization";

export interface TracesStore {
  insert(trace: Trace): Promise<void>;
  list(size?: number): Observable<Array<Trace>>;
  getAll(): Promise<Array<Trace>>;
  clear(): Promise<void>;
}

const DOC_TYPE = "trace";

class TracesStoreDB implements TracesStore {
  private readonly store: EMAIStore<Trace>;

  constructor() {
    this.store = new EMAIStore<Trace>(DOC_TYPE, docFrom, traceFrom);
  }

  async insert(trace: Trace): Promise<void> {
    await this.store.create(trace);
  }

  list(size = 100): Observable<Array<Trace>> {
    return new Observable<Array<Trace>>((subscriber) => {
      const subscription = this.store.changes.subscribe(() => {
        this.getAll(true, size)
          .then((traces) => {
            subscriber.next(traces);
          })
          .catch((err) => subscriber.error(err));
      });
      this.getAll(true, size)
        .then((traces) => {
          subscriber.next(traces);
        })
        .catch((err) => subscriber.error(err));

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  async getAll(
    reverseOrder?: boolean,
    limitSize?: number
  ): Promise<Array<Trace>> {
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

function docFrom(trace: Trace): any {
  const { timestamp, id, type, name, result, content } = trace;
  const stringifiedContent = serialize(content);
  return {
    timestamp: timestamp.getTime(),
    traceId: id,
    type,
    name,
    result,
    stringifiedContent,
  };
}

function traceFrom(doc: any): Trace {
  const { timestamp, traceId, type, name, result, stringifiedContent } = doc;
  const content = deserialize(stringifiedContent);
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
