import { InanoSQLTableConfig } from "@nano-sql/core/lib/interfaces";

export const geofencingStateModel: InanoSQLTableConfig = {
  name: "geofencingState",
  model: {
    "id:string": { pk: true },
    "proximity:string": {},
  },
};
