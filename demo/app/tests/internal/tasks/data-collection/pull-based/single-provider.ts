import { PullProvider } from "nativescript-emai-framework/internal/providers";
import { SinglePullProviderTask } from "nativescript-emai-framework/internal/tasks/data-collection/pull-based";
import { createPullProviderMock } from "./index";

import {
    on,
    createEvent,
    off,
} from "nativescript-task-dispatcher/internal/events";
import { Geolocation } from "nativescript-emai-framework/internal/providers/geolocation/geolocation";

describe("Single pull-based provider task", () => {
    let provider: PullProvider;
    let task: SinglePullProviderTask;

    beforeEach(() => {
        provider = createPullProviderMock();
        task = new SinglePullProviderTask("acquireData", provider);
    });

    it("checks if the underlying provider is ready", async () => {
        spyOn(provider, "checkIfIsReady").and.returnValue(Promise.resolve());
        await task.checkIfCanRun();
        expect(provider.checkIfIsReady).toHaveBeenCalled();
    });

    it("propagates the reason when the provider is not ready", async () => {
        spyOn(provider, "checkIfIsReady").and.returnValue(
            Promise.reject("Not yet")
        );
        await expectAsync(task.checkIfCanRun()).toBeRejectedWith("Not yet");
    });

    it("is able to prepare the underlying provider", async () => {
        spyOn(provider, "prepare").and.returnValue(Promise.resolve());
        await task.prepare();
        expect(provider.prepare).toHaveBeenCalled();
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
        const done = new Promise((resolve) => {
            const listenerId = on(outputEventName, (evt) => {
                if (evt.id === igniter.id) {
                    off(outputEventName, listenerId);
                    resolve(evt.data);
                }
            });
        });

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
