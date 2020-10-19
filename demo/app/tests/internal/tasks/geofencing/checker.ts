import { AreasOfInterestStore } from "nativescript-emai-framework/internal/persistence/stores/geofencing/aois";
import { GeofencingChecker } from "nativescript-emai-framework/internal/tasks/geofencing/checker";
import { createAreasOfInterestStoreMock } from "./index";
import { AreaOfInterest } from "nativescript-emai-framework/internal/tasks/geofencing/aoi";
import { Geolocation } from "nativescript-emai-framework/internal/providers/geolocation/geolocation";
import { GeofencingProximity } from "nativescript-emai-framework/internal/tasks/geofencing/geofencing-state";

describe("Geofencing checker", () => {
    let store: AreasOfInterestStore;
    let checker: GeofencingChecker;

    const nearbyRange = 75;

    const aoi1: AreaOfInterest = {
        id: "aoi1",
        name: "First area of interest",
        latitude: 39.99378719416474,
        longitude: -0.07388949394226074,
        radius: 45,
    };

    const aoi2: AreaOfInterest = {
        id: "aoi2",
        name: "Second area of interest",
        latitude: 39.99354471810093,
        longitude: -0.07317066192626952,
        radius: 30,
    };

    beforeEach(() => {
        store = createAreasOfInterestStoreMock();
        checker = new GeofencingChecker(store);
        spyOn(store, "getAll").and.returnValue(Promise.resolve([aoi1, aoi2]));
    });

    it("returns an empty list when no area of interest is nearby", async () => {
        const point = createGeolocation(
            39.994198168578016,
            -0.07218897342681885
        );
        const result = await checker.findNearby(point, nearbyRange);

        expect(result.length).toBe(0);
    });

    it("returns a list with one element and proximity 'nearby' when the given location is in the outer area", async () => {
        const point = createGeolocation(
            39.993602254871945,
            -0.0744849443435669
        );
        const result = await checker.findNearby(point, nearbyRange);

        expect(result.length).toBe(1);
        expect(result[0].proximity).toEqual(GeofencingProximity.NEARBY);
        expect(result[0].aoi.id).toEqual(aoi1.id);
    });

    it("returns a list with one element and proximity 'inside' when the given location is inside the inner area", async () => {
        const point = createGeolocation(
            39.99395569397331,
            -0.07432937622070312
        );
        const result = await checker.findNearby(point, nearbyRange);

        expect(result.length).toBe(1);
        expect(result[0].proximity).toEqual(GeofencingProximity.INSIDE);
        expect(result[0].aoi.id).toEqual(aoi1.id);
    });

    it("returns a list with two elements when the given location is inside one area and nearby another", async () => {
        const point = createGeolocation(
            39.99377075513676,
            -0.07363736629486084
        );
        const result = await checker.findNearby(point, nearbyRange);

        expect(result.length).toBe(2);
        expect(result[0].proximity).toEqual(GeofencingProximity.INSIDE);
        expect(result[0].aoi.id).toEqual(aoi1.id);
        expect(result[1].proximity).toEqual(GeofencingProximity.NEARBY);
        expect(result[1].aoi.id).toEqual(aoi2.id);
    });

    it("returns a list with two elements when the given location is inside two overlapping areas", async () => {
        const point = createGeolocation(
            39.99363924277056,
            -0.07344961166381836
        );
        const result = await checker.findNearby(point, nearbyRange);

        expect(result.length).toBe(2);
        expect(result[0].proximity).toEqual(GeofencingProximity.INSIDE);
        expect(result[0].aoi.id).toEqual(aoi1.id);
        expect(result[1].proximity).toEqual(GeofencingProximity.INSIDE);
        expect(result[1].aoi.id).toEqual(aoi2.id);
    });
});

function createGeolocation(latitude: number, longitude: number): Geolocation {
    return new Geolocation(latitude, longitude, 0, 10, 10, 0, 0, new Date());
}
