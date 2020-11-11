import { AreaOfInterest } from "../../../../tasks/geofencing/aoi";
import { areasOfInterestModel } from "./model";
import { pluginDB } from "../../db";

export interface AreasOfInterestStore {
  insert(aois: Array<AreaOfInterest>): Promise<void>;
  getAll(): Promise<Array<AreaOfInterest>>;
  deleteAll(): Promise<void>;
}

class AreasOfInterestStoreDB implements AreasOfInterestStore {
  private tableName = areasOfInterestModel.name;

  async insert(aois: Array<AreaOfInterest>): Promise<void> {
    const rows = aois.map((aoi) => ({ ...aoi }));

    const instance = await this.db();
    await instance.query("upsert", rows).exec();
  }

  async getAll(): Promise<Array<AreaOfInterest>> {
    const instance = await this.db();
    const rows = await instance.query("select").exec();
    return rows.map((row) => aoiFrom(row));
  }

  async deleteAll(): Promise<void> {
    const instance = await this.db();
    await instance.query("delete").exec();
  }

  private db(tableName = this.tableName) {
    return pluginDB.instance(tableName);
  }
}

function aoiFrom(row: any): AreaOfInterest {
  const { id, name, latitude, longitude, radius, category, level } = row;
  return {
    id,
    name,
    latitude,
    longitude,
    radius,
    category,
    level,
  };
}

export const areasOfInterestStoreDB = new AreasOfInterestStoreDB();
