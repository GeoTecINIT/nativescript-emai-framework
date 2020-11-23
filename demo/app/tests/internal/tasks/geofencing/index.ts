import { AreasOfInterestStore } from "@geotecinit/emai-framework/internal/persistence/stores/geofencing/aois";
import { AreaOfInterest } from "@geotecinit/emai-framework/internal/tasks/geofencing/aoi";
import {
    GeofencingStateStore,
    NearbyArea,
} from "@geotecinit/emai-framework/internal/persistence/stores/geofencing/state";
import { GeofencingProximity } from "@geotecinit/emai-framework/internal/tasks/geofencing/geofencing-state";
import {
    GeofencingChecker,
    GeofencingResult,
} from "@geotecinit/emai-framework/internal/tasks/geofencing/checker";
import { Geolocation } from "@geotecinit/emai-framework/internal/providers/geolocation/geolocation";

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

export function createGeofencingStateStoreMock(): GeofencingStateStore {
    return {
        getProximity(id: string): Promise<GeofencingProximity> {
            return Promise.resolve(GeofencingProximity.OUTSIDE);
        },
        updateProximity(
            id: string,
            proximity: GeofencingProximity
        ): Promise<void> {
            return Promise.resolve();
        },
        getKnownNearbyAreas(): Promise<Array<NearbyArea>> {
            return Promise.resolve([]);
        },
        clear(): Promise<void> {
            return Promise.resolve();
        },
    };
}

export function createGeofencingCheckerMock(): GeofencingChecker {
    return {
        findNearby(
            location: Geolocation,
            nearbyRange: number
        ): Promise<Array<GeofencingResult>> {
            return Promise.resolve([]);
        },
        findNearbyTrajectory(
            locations: Array<Geolocation>,
            nearbyRange: number
        ): Promise<Array<GeofencingResult>> {
            return Promise.resolve([]);
        },
    } as GeofencingChecker;
}
