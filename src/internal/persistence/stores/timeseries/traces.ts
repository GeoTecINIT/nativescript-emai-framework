import { Trace } from "../../../tasks/tracing";
import {
  deserialize,
  serialize,
} from "nativescript-task-dispatcher/internal/utils/serialization";
import { AbstractTimeSeriesStore } from "./common";

const DOC_TYPE = "trace";

class TracesStoreDB extends AbstractTimeSeriesStore<Trace> {
  constructor() {
    super(DOC_TYPE, docFrom, traceFrom, true);
  }
}

function docFrom(trace: Trace): any {
  const { timestamp, id, type, name, result, content } = trace;
  const stringifiedContent = serialize(content);
  return {
    timestamp: timestamp.getTime(),
    id,
    type,
    name,
    result,
    stringifiedContent,
  };
}

function traceFrom(doc: any): Trace {
  const { timestamp, id, type, name, result, stringifiedContent } = doc;
  const content = deserialize(stringifiedContent);
  return {
    timestamp: new Date(timestamp),
    id,
    type,
    name,
    result,
    content,
  };
}

export const localTracesStore = new TracesStoreDB();
