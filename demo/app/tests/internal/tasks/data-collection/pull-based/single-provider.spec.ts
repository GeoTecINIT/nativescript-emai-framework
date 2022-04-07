import { PullProvider } from "@geotecinit/emai-framework/internal/providers";
import { SinglePullProviderTask } from "@geotecinit/emai-framework/internal/tasks/data-collection/pull-based";
import { createPullProviderMock } from "./index";
import { Geolocation } from "@geotecinit/emai-framework/internal/providers/geolocation/geolocation";
import {
    createEvent,
    listenToEventTrigger,
} from "nativescript-task-dispatcher/testing/events";

describe("Single pull-based provider task", () => {
    let provider: PullProvider;
    let task: SinglePullProviderTask;

    beforeEach(() => {
        provider = createPullProviderMock();
        task = new SinglePullProviderTask(provider, "Phone");
    });

    it("should have a predictable name", () => {
        expect(task.name).toEqual("acquirePhoneGeolocation");
    });

    it("runs and generates an event with the collected data", async () => {
        const expectedData = new Geolocation(
            0.0,
            0.0,
            0,
            0,
            0,
            0,
            0,
            new Date()
        );
        spyOn(provider, "next").and.returnValue([
            Promise.resolve(expectedData),
            () => null,
        ]);

        const igniter = createEvent("fake");
        const outputEventName = "geolocationAcquired";
        const done = listenToEventTrigger(outputEventName, igniter.id);

        task.run({}, igniter);
        const acquiredData = (await done) as Geolocation;
        expect(acquiredData.type).toEqual(expectedData.type);
    });

    it("indicates the underlying provider to stop collecting data on cancel", async () => {
        const interrupter = jasmine.createSpy();
        spyOn(provider, "next").and.returnValue([
            new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
            interrupter,
        ]);

        const runPromise = task.run({}, createEvent("fake"));
        task.cancel();
        await runPromise;

        expect(interrupter).toHaveBeenCalled();
    });
});
