import { InanoSQLTableConfig } from "@nano-sql/core/lib/interfaces";

export const tracesModel: InanoSQLTableConfig = {
  name: "traces",
  model: {
    "id:int": { pk: true, ai: true },
    "timestamp:int": {},
    "traceId:string": {},
    "type:string": {},
    "name:string": {},
    "result:string": {},
    "content:object": {},
  },
};
