import { AreaOfInterest } from "../../../tasks/geofencing/aoi";
import { EMAIStore } from "../emai-store";

export interface AreasOfInterestStore {
  insert(aois: Array<AreaOfInterest>): Promise<void>;
  getAll(): Promise<Array<AreaOfInterest>>;
  deleteAll(): Promise<void>;
}

const DOC_TYPE = "area-of-interest";

class AreasOfInterestStoreDB implements AreasOfInterestStore {
  private readonly store: EMAIStore<AreaOfInterest>;

  constructor() {
    this.store = new EMAIStore<AreaOfInterest>(DOC_TYPE, docFrom, aoiFrom);
  }

  async insert(aois: Array<AreaOfInterest>): Promise<void> {
    await this.store.insert(aois);
  }

  async getAll(): Promise<Array<AreaOfInterest>> {
    return this.store.fetch();
  }

  async deleteAll(): Promise<void> {
    return this.store.clear();
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
