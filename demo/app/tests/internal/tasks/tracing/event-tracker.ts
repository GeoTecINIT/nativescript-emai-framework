import { EventTrackerTask } from "nativescript-emai-framework/internal/tasks/tracing/event-tracker";
import {
    createEvent,
    DispatchableEvent,
    off,
    on,
} from "nativescript-task-dispatcher/internal/events";
import { TracesStore } from "nativescript-emai-framework/internal/persistence/stores/traces";
import { createTracesStoreMock } from "./index";
import {
    TraceResult,
    TraceType,
} from "nativescript-emai-framework/internal/tasks/tracing";

describe("Event tracker task", () => {
    const taskName = "trackEvent";
    let tracesStore: TracesStore;

    beforeEach(() => {
        tracesStore = createTracesStoreMock();
        spyOn(tracesStore, "insert");
    });

    it("tracks an event and its data", async () => {
        const fakeEvent = createEvent(taskName, {
            data: { with: "testData" },
        });

        const eventTracker = new EventTrackerTask(
            "trackEvent",
            {},
            tracesStore
        );

        const done = listenToTaskFinished(fakeEvent);

        eventTracker.run({}, fakeEvent);
        await done;

        expect(tracesStore.insert).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: fakeEvent.id,
                type: TraceType.EVENT,
                name: fakeEvent.name,
                result: TraceResult.OK,
                content: fakeEvent.data,
            })
        );
    });

    it("tracks a sensitive event without its data", async () => {
        const fakeEvent = createEvent("testEvent", {
            data: { with: "sensitiveData" },
        });

        const eventTracker = new EventTrackerTask(
            "trackEvent",
            {
                sensitiveData: true,
            },
            tracesStore
        );

        const done = listenToTaskFinished(fakeEvent);

        eventTracker.run({}, fakeEvent);
        await done;

        expect(tracesStore.insert).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: fakeEvent.id,
                type: TraceType.EVENT,
                name: fakeEvent.name,
                result: TraceResult.OK,
                content: {},
            })
        );
    });
});

function listenToTaskFinished(source: DispatchableEvent) {
    return new Promise((resolve) => {
        const listenerId = on("trackEventFinished", (evt) => {
            if (evt.id === source.id) {
                off("trackEventFinished", listenerId);
                resolve();
            }
        });
    });
}
