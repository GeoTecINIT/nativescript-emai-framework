import { NativeSQLite } from "@nano-sql/adapter-sqlite-nativescript";
import { nSQL } from "@nano-sql/core/lib";
import { recordsModel } from "./records/model";
import { areasOfInterestModel } from "./geofencing/aois/model";
import { notificationsModel } from "./notifications/model";
import { tracesModel } from "./traces/model";

const dbName = "emai-framework";

class PluginDB {
  private dbInitialized: boolean = false;
  private createDBProcedure: Promise<void>;

  async createDB() {
    if (this.dbInitialized) {
      return;
    }
    if (!this.createDBProcedure) {
      this.createDBProcedure = nSQL().createDatabase({
        id: dbName,
        mode: new NativeSQLite(),
        tables: [
          recordsModel,
          areasOfInterestModel,
          notificationsModel,
          tracesModel,
        ],
      });
    }
    await this.createDBProcedure;
    this.dbInitialized = true;
  }

  async instance(tableName: string) {
    await this.createDB();
    if (nSQL().selectedDB !== dbName) {
      nSQL().useDatabase(dbName);
    }
    return nSQL(tableName);
  }
}

export const pluginDB = new PluginDB();
