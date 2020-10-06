import { TracesStore } from "nativescript-emai-framework/internal/persistence/stores/traces";
import { createTracesStoreMock } from "./index";
import {
    TraceableTask,
    TracerConfig,
    TraceType,
    TraceResult,
} from "nativescript-emai-framework/internal/tasks/tracing";
import {
    TaskOutcome,
    TaskParams,
} from "nativescript-task-dispatcher/internal/tasks/task";
import {
    createEvent,
    DispatchableEvent,
    off,
    on,
    TaskDispatcherEvent,
} from "nativescript-task-dispatcher/internal/events";

const dummyTaskName = "doNothing";
const dummyTaskResult = { secret: "doNotShare" };
const dummyTaskError = new Error("I've done nothing and still I've failed");

describe("Traceable task", () => {
    let tracesStore: TracesStore;

    beforeEach(() => {
        tracesStore = createTracesStoreMock();
        spyOn(tracesStore, "insert");
    });

    it("successfully runs and traces its execution and result", async () => {
        const invocationEvent = createEvent("test");

        const traceableTask = new DummyTraceableTask({}, tracesStore, false);

        const done = listenToTaskFinished(invocationEvent);

        traceableTask.run({}, invocationEvent);
        await done;

        expect(tracesStore.insert).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: invocationEvent.id,
                type: TraceType.TASK,
                name: dummyTaskName,
                result: TraceResult.OK,
                content: {
                    took: jasmine.anything(),
                    invokedBy: invocationEvent.name,
                    outcome: dummyTaskResult,
                },
            })
        );
    });

    it("successfully runs and traces its execution and but not its sensitive result", async () => {
        const invocationEvent = createEvent("test");

        const traceableTask = new DummyTraceableTask(
            { sensitiveData: true },
            tracesStore,
            false
        );

        const done = listenToTaskFinished(invocationEvent);

        traceableTask.run({}, invocationEvent);
        await done;

        expect(tracesStore.insert).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: invocationEvent.id,
                type: TraceType.TASK,
                name: dummyTaskName,
                result: TraceResult.OK,
                content: {
                    took: jasmine.anything(),
                    invokedBy: invocationEvent.name,
                    outcome: {},
                },
            })
        );
    });

    it("fails to run but traces its execution and its error message", async () => {
        const invocationEvent = createEvent("test");

        const traceableTask = new DummyTraceableTask({}, tracesStore, true);

        const done = listenToTaskFinished(invocationEvent, true);

        traceableTask.run({}, invocationEvent);
        await done;

        expect(tracesStore.insert).toHaveBeenCalledWith(
            jasmine.objectContaining({
                id: invocationEvent.id,
                type: TraceType.TASK,
                name: dummyTaskName,
                result: TraceResult.ERROR,
                content: {
                    took: jasmine.anything(),
                    invokedBy: invocationEvent.name,
                    message: dummyTaskError.stack,
                },
            })
        );
    });
});

class DummyTraceableTask extends TraceableTask {
    constructor(
        taskConfig: TracerConfig,
        tracesStore: TracesStore,
        private faulty: boolean
    ) {
        super(dummyTaskName, taskConfig, tracesStore);
    }

    protected async onTracedRun(
        taskParams: TaskParams,
        invocationEvent: DispatchableEvent
    ): Promise<void | TaskOutcome> {
        if (this.faulty) {
            throw dummyTaskError;
        }
        return { result: dummyTaskResult };
    }
}

function listenToTaskFinished(source: DispatchableEvent, error = false) {
    const eventName = error
        ? TaskDispatcherEvent.TaskChainFinished
        : "doNothingFinished";
    return new Promise((resolve) => {
        const listenerId = on(eventName, (evt) => {
            if (evt.id === source.id) {
                off(eventName, listenerId);
                resolve();
            }
        });
    });
}