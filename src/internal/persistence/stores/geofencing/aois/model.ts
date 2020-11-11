import { InanoSQLTableConfig } from "@nano-sql/core/lib/interfaces";

export const areasOfInterestModel: InanoSQLTableConfig = {
  name: "areasOfInterest",
  model: {
    "id:string": { pk: true },
    "name:string": {},
    "latitude:float": {},
    "longitude:float": {},
    "radius:int": {},
    "category:string": {},
    "level:int": {},
  },
};
