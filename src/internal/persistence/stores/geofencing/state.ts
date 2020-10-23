import { GeofencingProximity } from "../../../tasks/geofencing/geofencing-state";
import { Couchbase, QueryMeta } from "nativescript-couchbase-plugin";

export interface GeofencingStateStore {
  updateProximity(id: string, proximity: GeofencingProximity): Promise<void>;
  getProximity(id: string): Promise<GeofencingProximity>;
  getKnownNearbyAreas(): Promise<Array<NearbyArea>>;
  clear(): Promise<void>;
}

const DB_NAME = "emai-geofencing";

class GeofencingStateStoreDB implements GeofencingStateStore {
  private readonly database: Couchbase;

  constructor() {
    this.database = new Couchbase(DB_NAME);
  }

  async updateProximity(
    id: string,
    proximity: GeofencingProximity
  ): Promise<void> {
    const prevState = await this.getProximity(id);
    if (proximity === GeofencingProximity.OUTSIDE) {
      if (prevState === GeofencingProximity.OUTSIDE) {
        return;
      }
      this.database.deleteDocument(id);
      return;
    }

    const doc = this.database.getDocument(id);
    if (!doc) {
      this.database.createDocument({ proximity }, id);
      return;
    }
    this.database.updateDocument(id, { proximity });
  }

  async getProximity(id: string): Promise<GeofencingProximity> {
    const doc = this.database.getDocument(id);
    if (!doc) {
      return GeofencingProximity.OUTSIDE;
    }
    return doc.proximity;
  }

  async getKnownNearbyAreas(): Promise<Array<NearbyArea>> {
    const docs = this.database.query();
    return docs.map((doc) => nearbyAreaFrom(doc));
  }

  clear(): Promise<void> {
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

function nearbyAreaFrom(doc: any): NearbyArea {
  return { id: doc.id, proximity: doc.proximity };
}

export interface NearbyArea {
  id: string;
  proximity: GeofencingProximity;
}

export const geofencingStateStoreDB = new GeofencingStateStoreDB();
