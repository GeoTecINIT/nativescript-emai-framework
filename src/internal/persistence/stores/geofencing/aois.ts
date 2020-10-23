import { AreaOfInterest } from "../../../tasks/geofencing/aoi";
import { Couchbase, QueryMeta } from "nativescript-couchbase-plugin";

export interface AreasOfInterestStore {
  insert(aois: Array<AreaOfInterest>): Promise<void>;
  getAll(): Promise<Array<AreaOfInterest>>;
  deleteAll(): Promise<void>;
}

const DB_NAME = "emai-aois";

class AreasOfInterestStoreDB implements AreasOfInterestStore {
  private readonly database: Couchbase;

  constructor() {
    this.database = new Couchbase(DB_NAME);
  }

  insert(aois: Array<AreaOfInterest>): Promise<void> {
    const docs = aois.map((aoi) => docFrom(aoi));
    return new Promise((resolve) => {
      this.database.inBatch(() => {
        for (let doc of docs) {
          const id = doc.id;
          delete doc["id"];
          this.database.createDocument(doc, id);
        }
        resolve();
      });
    });
  }

  async getAll(): Promise<Array<AreaOfInterest>> {
    const docs = this.database.query();
    return docs.map((doc) => aoiFrom(doc));
  }

  deleteAll(): Promise<void> {
    return new Promise((resolve) => {
      this.database.inBatch(() => {
        const docs = this.database.query({ select: [QueryMeta.ID] });
        for (let doc of docs) {
          this.database.deleteDocument(doc.id);
        }
        resolve();
      });
    });
  }
}

function docFrom(aoi: AreaOfInterest): any {
  return { ...aoi };
}

function aoiFrom(doc: any): AreaOfInterest {
  const { id, name, latitude, longitude, radius, category, level } = doc;
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
