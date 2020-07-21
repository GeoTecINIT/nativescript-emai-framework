import { InanoSQLTableConfig } from "@nano-sql/core/lib/interfaces";

export const recordsModel: InanoSQLTableConfig = {
  name: "records",
  model: {
    "id:int": { pk: true, ai: true },
    "type:string": {},
    "timestamp:int": {},
    "change:string": {},
    "extraProperties:any": {},
  },
};
