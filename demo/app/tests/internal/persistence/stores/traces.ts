import {
    Trace,
    TraceResult,
    TraceType,
} from "nativescript-emai-framework/internal/tasks/tracing";

import {
    TracesStore,
    tracesStoreDB,
} from "nativescript-emai-framework/internal/persistence/stores/traces";
import { first, last, take } from "rxjs/operators";

describe("Traces store", () => {
    const store: TracesStore = tracesStoreDB;
    const createFakeTrace = fakeTraceCreator();

    const traces: Array<Trace> = [
        createFakeTrace(
            TraceType.EVENT,
            "userStartedBeingStill",
            TraceResult.OK,
            { someEvtData: "it's ok" }
        ),
        createFakeTrace(
            TraceType.TASK,
            "acquirePhoneGeolocation",
            TraceResult.OK,
            {
                invokedBy: "taskSchedulerRun",
                took: 15000,
                output: { someLocationData: {} },
            }
        ),
        createFakeTrace(
            TraceType.TASK,
            "acquirePhoneGeolocation",
            TraceResult.ERROR,
            {
                invokedBy: "taskSchedulerRun",
                took: 55000,
                message: "GPS did not return a fix",
            }
        ),
    ];

    beforeAll(async () => {
        await store.clear();
    });

    it("allows to insert a trace", async () => {
        await store.insert(traces[0]);
    });

    it("allows to query all stored traces", async () => {
        for (let trace of traces) {
            await store.insert(trace);
        }

        const storedTraces = await store.list().pipe(first()).toPromise();

        expect(storedTraces.length).toBe(3);
        expect(storedTraces[0]).toEqual(traces[2]);
        expect(storedTraces[1]).toEqual(traces[1]);
        expect(storedTraces[2]).toEqual(traces[0]);
    });

    it("allows to listen to stored traces changes", async () => {
        await store.insert(traces[0]);
        await store.insert(traces[1]);

        const lastUpdate = store.list().pipe(take(2), last()).toPromise();
        store.insert(traces[2]);
        const storedTraces = await lastUpdate;

        expect(storedTraces.length).toBe(3);
        expect(storedTraces[0]).toEqual(traces[2]);
    });

    it("allows to limit the amount of records to be listened", async () => {
        await store.insert(traces[0]);
        await store.insert(traces[1]);

        const lastUpdate = store.list(2).pipe(take(2), last()).toPromise();
        store.insert(traces[2]);
        const storedTraces = await lastUpdate;

        expect(storedTraces.length).toBe(2);
        expect(storedTraces[0]).toEqual(traces[2]);
        expect(storedTraces[1]).toEqual(traces[1]);
    });

    it("allows to recover all the stored records from the oldest to the newest", async () => {
        for (let trace of traces) {
            await store.insert(trace);
        }

        const storedTraces = await store.getAll();

        expect(storedTraces.length).toBe(3);
        expect(storedTraces[0]).toEqual(traces[0]);
        expect(storedTraces[1]).toEqual(traces[1]);
        expect(storedTraces[2]).toEqual(traces[2]);
    });

    afterEach(async () => {
        await store.clear();
    });
});

function fakeTraceCreator() {
    let recordCount = 0;
    return (
        type: TraceType,
        name: string,
        result: TraceResult,
        content: { [key: string]: any }
    ): Trace => {
        return {
            timestamp: new Date(Date.now() + recordCount++ * 1000),
            id: `${Date.now()}`,
            type,
            name,
            result,
            content,
        };
    };
}
