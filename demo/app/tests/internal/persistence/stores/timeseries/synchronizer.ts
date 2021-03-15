import { Observable } from "rxjs";
import {
    LocalTimeSeriesStore,
    TimeSeriesRecord,
    TimeSeriesStore,
} from "@geotecinit/emai-framework/internal/persistence/stores/timeseries/common";
import { TimeSeriesSyncedStore } from "../../../../../../../src/internal/persistence/stores/timeseries/synchronizer";

describe("Time series synced store", () => {
    let localStoreMock: LocalTimeSeriesStore<TimeSeriesRecord>;
    let externalStoreMock: TimeSeriesStore<TimeSeriesRecord>;
    let syncedStore: TimeSeriesSyncedStore<TimeSeriesRecord>;

    const fakeRecord1: TimeSeriesRecord = {
        timestamp: new Date(),
    };
    const fakeRecord2: TimeSeriesRecord = {
        timestamp: new Date(),
    };

    beforeEach(() => {
        localStoreMock = createLocalStoreMock();
        externalStoreMock = createExternalStoreMock();
        syncedStore = new TimeSeriesSyncedStore<TimeSeriesRecord>(
            "TimeSeriesStore",
            localStoreMock
        );

        spyOn(localStoreMock, "insert");
    });

    it("inserts a record only locally", async () => {
        await syncedStore.insert(fakeRecord1);
        expect(localStoreMock.insert).toHaveBeenCalledWith(fakeRecord1, false);
    });

    it("marks a record as synced when stored both locally and externally", async () => {
        spyOn(externalStoreMock, "insert");
        syncedStore.setExternalStore(externalStoreMock);
        await syncedStore.insert(fakeRecord1);
        expect(externalStoreMock.insert).toHaveBeenCalledWith(fakeRecord1);
        expect(localStoreMock.insert).toHaveBeenCalledWith(fakeRecord1, true);
    });

    it("marks a record as not synced when external storage fails", async () => {
        spyOn(externalStoreMock, "insert").and.rejectWith("Could not store");
        syncedStore.setExternalStore(externalStoreMock);
        await syncedStore.insert(fakeRecord1);
        expect(localStoreMock.insert).toHaveBeenCalledWith(fakeRecord1, false);
    });

    it("does not perform sync actions when no external store is provided", async () => {
        spyOn(localStoreMock, "getNotSynchronized");
        await syncedStore.sync();
        expect(localStoreMock.getNotSynchronized).not.toHaveBeenCalled();
    });

    it("syncs pending unsynced records when required", async () => {
        spyOn(localStoreMock, "getNotSynchronized").and.returnValue(
            Promise.resolve([fakeRecord1, fakeRecord2])
        );
        spyOn(localStoreMock, "markAsSynchronized");
        spyOn(externalStoreMock, "insert");
        syncedStore.setExternalStore(externalStoreMock);
        await syncedStore.sync();
        expect(externalStoreMock.insert).toHaveBeenCalledTimes(2);
        expect(localStoreMock.markAsSynchronized).toHaveBeenCalledTimes(2);
    });

    it("propagates list call to local store", () => {
        spyOn(localStoreMock, "list");
        syncedStore.list(10);
        expect(localStoreMock.list).toHaveBeenCalledWith(10);
    });

    it("propagates getAll call to local store", async () => {
        spyOn(localStoreMock, "getAll");
        await syncedStore.getAll();
        expect(localStoreMock.getAll).toHaveBeenCalled();
    });

    it("propagates clear call to local store", async () => {
        spyOn(localStoreMock, "clear");
        await syncedStore.clear();
        expect(localStoreMock.clear).toHaveBeenCalled();
    });
});

function createLocalStoreMock(): LocalTimeSeriesStore<TimeSeriesRecord> {
    return {
        getAll(): Promise<Array<TimeSeriesRecord>> {
            return Promise.resolve(undefined);
        },
        getNotSynchronized(): Promise<Array<TimeSeriesRecord>> {
            return Promise.resolve(undefined);
        },
        list(size?: number): Observable<Array<TimeSeriesRecord>> {
            return undefined;
        },
        markAsSynchronized(record: TimeSeriesRecord): Promise<void> {
            return Promise.resolve(undefined);
        },
        clear(): Promise<void> {
            return Promise.resolve(undefined);
        },
        insert(
            record: TimeSeriesRecord,
            synchronized?: boolean
        ): Promise<void> {
            return Promise.resolve(undefined);
        },
    };
}

function createExternalStoreMock(): TimeSeriesStore<TimeSeriesRecord> {
    return {
        getAll(): Promise<Array<TimeSeriesRecord>> {
            return Promise.resolve(undefined);
        },
        insert(record: TimeSeriesRecord): Promise<void> {
            return Promise.resolve(undefined);
        },
        list(size?: number): Observable<Array<TimeSeriesRecord>> {
            return undefined;
        },
        clear(): Promise<void> {
            return Promise.resolve(undefined);
        },
    };
}
