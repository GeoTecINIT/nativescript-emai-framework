import {
    RecordsStore,
    recordsStoreDB,
} from "nativescript-emai-framework/internal/persistence/stores/records";
import {
    Record,
    Change,
} from "nativescript-emai-framework/internal/providers/base-record";

import { Geolocation } from "nativescript-emai-framework/internal/providers/geolocation/geolocation";
import {
    HumanActivityChange,
    HumanActivity,
} from "nativescript-emai-framework/internal/providers/activity-recognition/human-activity-change";

import { first, last, take } from "rxjs/operators";

describe("Records store", () => {
    const store: RecordsStore = recordsStoreDB;

    const records: Array<Record> = [
        new Geolocation(39.1, -0.1, 122, 10.1, 10.1, 12.4, 175.9, nowMinus(3)),
        new HumanActivityChange(HumanActivity.STILL, Change.START, nowMinus(2)),
        new Geolocation(39.2, -0.2, 120, 13.1, 13.1, 10.4, 60.7, nowMinus(1)),
    ];

    it("allows to insert a record", async () => {
        await store.insert(records[0]);
    });

    it("allows to query all stored records", async () => {
        for (let record of records) {
            await store.insert(record);
        }

        const storedRecords = await store.list().pipe(first()).toPromise();

        expect(storedRecords.length).toBe(3);
        expect(storedRecords[0]).toEqual(records[2]);
        expect(storedRecords[1]).toEqual(records[1]);
        expect(storedRecords[2]).toEqual(records[0]);
    });

    it("allows to listen to stored records changes", async () => {
        await store.insert(records[0]);
        await store.insert(records[1]);

        const lastUpdate = store.list().pipe(take(2), last()).toPromise();
        store.insert(records[2]);
        const storedRecords = await lastUpdate;

        expect(storedRecords.length).toBe(3);
        expect(storedRecords[0]).toEqual(records[2]);
    });

    it("allows to limit the amount of records to be listed", async () => {
        await store.insert(records[0]);
        await store.insert(records[1]);

        const lastUpdate = store.list(2).pipe(take(2), last()).toPromise();
        store.insert(records[2]);
        const storedRecords = await lastUpdate;

        expect(storedRecords.length).toBe(2);
        expect(storedRecords[0]).toEqual(records[2]);
        expect(storedRecords[1]).toEqual(records[1]);
    });

    afterEach(async () => {
        await recordsStoreDB.clear();
    });
});

function nowMinus(seconds: number) {
    const millis = seconds * 1000;
    return new Date(Date.now() - millis);
}
