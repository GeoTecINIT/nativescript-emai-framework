import { InanoSQLTableConfig } from "@nano-sql/core/lib/interfaces";

export const notificationsModel: InanoSQLTableConfig = {
  name: "notifications",
  model: {
    "id:int": { pk: true },
    "title:string": {},
    "tapContentType:string": {},
    "tapContentId:string": {},
    "body:string": {},
    "timestamp:int": {},
  },
};
