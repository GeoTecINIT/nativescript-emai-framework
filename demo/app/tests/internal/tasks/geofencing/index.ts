import { AreasOfInterestStore } from "nativescript-emai-framework/internal/persistence/stores/geofencing/aois";
import { AreaOfInterest } from "nativescript-emai-framework/internal/tasks/geofencing/aoi";

export function createAreasOfInterestStoreMock(): AreasOfInterestStore {
    return {
        insert(aois: Array<AreaOfInterest>): Promise<void> {
            return Promise.resolve();
        },
        getAll(): Promise<Array<AreaOfInterest>> {
            return Promise.resolve([]);
        },
        deleteAll(): Promise<void> {
            return Promise.resolve();
        },
    };
}
