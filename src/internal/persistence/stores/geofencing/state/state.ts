import { GeofencingProximity } from "../../../../tasks/geofencing/geofencing-state";
import { geofencingStateModel } from "./model";
import { pluginDB } from "../../db";

export interface GeofencingStateStore {
  updateProximity(id: string, proximity: GeofencingProximity): Promise<void>;
  getProximity(id: string): Promise<GeofencingProximity>;
  clear(): Promise<void>;
}

class GeofencingStateStoreDB implements GeofencingStateStore {
  private tableName = geofencingStateModel.name;

  async updateProximity(
    id: string,
    proximity: GeofencingProximity
  ): Promise<void> {
    const instance = await this.db();
    const prevState = await this.getProximity(id);
    if (proximity === GeofencingProximity.OUTSIDE) {
      if (prevState === GeofencingProximity.OUTSIDE) {
        return;
      }
      await instance.query("delete").where(["id", "=", id]).exec();
      return;
    }

    await instance.query("upsert", { id, proximity }).exec();
  }

  async getProximity(id: string): Promise<GeofencingProximity> {
    const instance = await this.db();

    const rows = await instance.query("select").where(["id", "=", id]).exec();
    if (rows.length === 0) {
      return GeofencingProximity.OUTSIDE;
    }

    return rows[0].proximity;
  }

  async clear(): Promise<void> {
    const instance = await this.db();
    await instance.query("delete").exec();
  }

  private db(tableName = this.tableName) {
    return pluginDB.instance(tableName);
  }
}

export const geofencingStateStoreDB = new GeofencingStateStoreDB();
