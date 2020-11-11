import {Geolocation} from "nativescript-emai-framework/internal/providers/geolocation/geolocation";
import {AreaOfInterest} from "nativescript-emai-framework/internal/tasks/geofencing/aoi";
import {GeofencingStateStore} from "nativescript-emai-framework/internal/persistence/stores/geofencing/state";
import {GeofencingChecker} from "nativescript-emai-framework/internal/tasks/geofencing/checker";
import {AreasOfInterestStore} from "nativescript-emai-framework/internal/persistence/stores/geofencing/aois";
import {GeofencingTask} from "nativescript-emai-framework/internal/tasks/geofencing/task";
import {createEvent, DispatchableEvent, off, on,} from "nativescript-task-dispatcher/internal/events";
import {createAreasOfInterestStoreMock, createGeofencingCheckerMock, createGeofencingStateStoreMock,} from "./index";
import {GeofencingProximity} from "nativescript-emai-framework/internal/tasks/geofencing/geofencing-state";
import {Change, RecordType} from "nativescript-emai-framework/internal/providers/base-record";
import {AoIProximityChange} from "nativescript-emai-framework/internal/tasks/geofencing/aoi";


describe("Geofencing task", () => {
    const location = createFakeLocation();
    const nearbyRange = 100;
    const aoi1 = createAreaOfInterest("aoi1");
    const aoi2 = createAreaOfInterest("aoi2");

    let invocationEvent: DispatchableEvent;
    let state: GeofencingStateStore;
    let checker: GeofencingChecker;
    let aoisStore: AreasOfInterestStore;
    let task: GeofencingTask;

    beforeEach(() => {
        invocationEvent = createEvent("locationAcquired", {
            data: location,
        });
        state = createGeofencingStateStoreMock();
        checker = createGeofencingCheckerMock();
        aoisStore = createAreasOfInterestStoreMock();
        task = new GeofencingTask(
            "checkAreaOfInterestProximity",
            {},
            state,
            checker,
            aoisStore
        );
        spyOn(state, "updateProximity");
        spyOn(aoisStore, "getAll").and.returnValue(
            Promise.resolve([aoi1, aoi2])
        );
    });

    it("outputs a default event when no area is nearby and no area was nearby", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([])
        );

        const done = listenToTaskFinished(
            "checkAreaOfInterestProximityFinished",
            invocationEvent.id
        );

        task.run({ nearbyRange }, invocationEvent);
        await done;
        expect(checker.findNearby).toHaveBeenCalled();
    });

    it("outputs a default event when no area is nearby and no area was nearby a given trajectory", async () => {
        spyOn(checker, "findNearbyTrajectory")
            .withArgs([location, location], nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([])
        );

        const invocationEvent = createEvent("locationAcquired", {
            data: [location, location],
        });
        const done = listenToTaskFinished(
            "checkAreaOfInterestProximityFinished",
            invocationEvent.id
        );

        task.run({ nearbyRange }, invocationEvent);
        await done;
        expect(checker.findNearbyTrajectory).toHaveBeenCalled();
    });

    it("outputs a 'movedAwayFromAreaOfInterest' event when there was an area nearby but no longer it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([
                { id: aoi1.id, proximity: GeofencingProximity.NEARBY },
            ])
        );

        const done = listenToTaskFinished(
            "movedAwayFromAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.NEARBY,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.OUTSIDE
        );
    });

    it("outputs a 'movedAwayFromAreaOfInterest' event when there were multiple areas nearby but they are no longer there", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([
                { id: aoi1.id, proximity: GeofencingProximity.NEARBY },
                { id: aoi2.id, proximity: GeofencingProximity.NEARBY },
            ])
        );

        const done = listenToTaskFinished(
            "movedAwayFromAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(2);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(aoi1,
            GeofencingProximity.NEARBY,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(aoiProximityChanges[1]).toEqual(aoiProximityChangeFrom(aoi2,
            GeofencingProximity.NEARBY,
            Change.END,
            aoiProximityChanges[1].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.OUTSIDE
        );
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.OUTSIDE
        );
    });

    it("outputs a 'movedOutsideFromAreaOfInterest' event when it was inside an area but no longer it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([
                { id: aoi1.id, proximity: GeofencingProximity.INSIDE },
            ])
        );

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedOutsideFromAreaOfInterest' event when it was inside multiple areas but no longer it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([
                { id: aoi1.id, proximity: GeofencingProximity.INSIDE },
                { id: aoi2.id, proximity: GeofencingProximity.INSIDE },
            ])
        );

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(2);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(aoiProximityChanges[1]).toEqual(aoiProximityChangeFrom(
            aoi2,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[1].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedOutsideFromAreaOfInterest' event when it was inside an area and nearby another but no longer it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(Promise.resolve([]));
        spyOn(state, "getKnownNearbyAreas").and.returnValue(
            Promise.resolve([
                { id: aoi1.id, proximity: GeofencingProximity.INSIDE },
                { id: aoi2.id, proximity: GeofencingProximity.NEARBY },
            ])
        );

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
        expect(state.updateProximity).not.toHaveBeenCalledWith(
            aoi2.id,
            jasmine.anything()
        );
    });

    it("outputs a 'movedCloseToAreaOfInterest' event when it was not close to an area but it is now", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.OUTSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedCloseToAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(aoi1,
            GeofencingProximity.NEARBY,
            Change.START,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedCloseToAreaOfInterest' event when it was not close to multiple areas but it is now", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                    { aoi: aoi2, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.OUTSIDE);
            }
            if (id === aoi2.id) {
                return Promise.resolve(GeofencingProximity.OUTSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedCloseToAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(2);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.NEARBY,
            Change.START,
            aoiProximityChanges[0].timestamp
        ));
        expect(aoiProximityChanges[1]).toEqual(aoiProximityChangeFrom(
            aoi2,
            GeofencingProximity.NEARBY,
            Change.START,
            aoiProximityChanges[1].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedInsideAreaOfInterest' event when it was close to an area but now is inside", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.INSIDE },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.NEARBY);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedInsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.START,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.INSIDE
        );
    });

    it("outputs a 'movedInsideAreaOfInterest' event when it was close to multiple areas but now is inside", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.INSIDE },
                    { aoi: aoi2, proximity: GeofencingProximity.INSIDE },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.NEARBY);
            }
            if (id === aoi2.id) {
                return Promise.resolve(GeofencingProximity.NEARBY);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedInsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(2);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.START,
            aoiProximityChanges[0].timestamp
        ));
        expect(aoiProximityChanges[1]).toEqual(aoiProximityChangeFrom(
            aoi2,
            GeofencingProximity.INSIDE,
            Change.START,
            aoiProximityChanges[1].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.INSIDE
        );
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.INSIDE
        );
    });

    it("outputs a 'movedInsideAreaOfInterest' event when it was close to an area but now is inside it and close to another", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.INSIDE },
                    { aoi: aoi2, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.NEARBY);
            }
            if (id === aoi2.id) {
                return Promise.resolve(GeofencingProximity.OUTSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedInsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.START,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.INSIDE
        );
        expect(state.updateProximity).not.toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedOutsideAreaOfInterest' event when it was inside to an area but now is nearby", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.INSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedOutsideAreaOfInterest' event when it was inside multiple areas but now is nearby", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                    { aoi: aoi2, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.INSIDE);
            }
            if (id === aoi2.id) {
                return Promise.resolve(GeofencingProximity.INSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(2);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(aoiProximityChanges[1]).toEqual(aoiProximityChangeFrom(
            aoi2,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[1].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a 'movedOutsideAreaOfInterest' event when it was inside an area but now is nearby and another is close", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                    { aoi: aoi2, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.INSIDE);
            }
            if (id === aoi2.id) {
                return Promise.resolve(GeofencingProximity.OUTSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "movedOutsideAreaOfInterest",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        const aoiProximityChanges = await done;
        expect(aoiProximityChanges.length).toBe(1);
        expect(aoiProximityChanges[0]).toEqual(aoiProximityChangeFrom(
            aoi1,
            GeofencingProximity.INSIDE,
            Change.END,
            aoiProximityChanges[0].timestamp
        ));
        expect(state.updateProximity).toHaveBeenCalledWith(
            aoi1.id,
            GeofencingProximity.NEARBY
        );
        expect(state.updateProximity).not.toHaveBeenCalledWith(
            aoi2.id,
            GeofencingProximity.NEARBY
        );
    });

    it("outputs a default event when it was close to an area and still it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.NEARBY },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.NEARBY);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "checkAreaOfInterestProximityFinished",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        await done;
    });

    it("outputs a default event when it was inside an area and still it is", async () => {
        spyOn(checker, "findNearby")
            .withArgs(location, nearbyRange)
            .and.returnValue(
                Promise.resolve([
                    { aoi: aoi1, proximity: GeofencingProximity.INSIDE },
                ])
            );
        spyOn(state, "getProximity").and.callFake((id) => {
            if (id === aoi1.id) {
                return Promise.resolve(GeofencingProximity.INSIDE);
            }
            return Promise.reject(`Unexpected id: ${id}`);
        });

        const done = listenToTaskFinished(
            "checkAreaOfInterestProximityFinished",
            invocationEvent.id
        );
        task.run({ nearbyRange }, invocationEvent);
        await done;
    });
});

function listenToTaskFinished(eventName: string, id: string): Promise<any> {
    return new Promise((resolve) => {
        const listenerId = on(eventName, (evt) => {
            if (evt.id === id) {
                off(eventName, listenerId);
                resolve(evt.data);
            }
        });
    });
}

function createFakeLocation(): Geolocation {
    return new Geolocation(39.9938, -0.0736, 50, 10, 10, 0, 0, new Date());
}

function createAreaOfInterest(id: string): AreaOfInterest {
    return {
        id,
        name: `Area of interest (${id})`,
        latitude: 39.9938,
        longitude: -0.0736,
        radius: 50,
    };
}

function aoiProximityChangeFrom(
    aoi: AreaOfInterest,
    proximity: GeofencingProximity,
    change: Change,
    timestamp: Date
): AoIProximityChange {
    return {
        type: RecordType.AoIProximityChange,
        timestamp,
        change,
        aoi,
        proximity
    };
}
