import { PullProvider } from "nativescript-emai-framework/internal/providers";
import { BatchPullProviderTask } from "nativescript-emai-framework/internal/tasks/data-collection/pull-based";
import { createPullProviderMock } from "./index";
import { Geolocation } from "nativescript-emai-framework/internal/providers/geolocation/geolocation";
import {
    createEvent,
    off,
    on,
} from "nativescript-task-dispatcher/internal/events";
import { RecordType } from "nativescript-emai-framework/internal/providers/base-record";
import { ProviderInterrupter } from "nativescript-emai-framework/internal/providers/provider-interrupter";

describe("Batch pull-based provider task", () => {
    let provider: PullProvider;
    let task: BatchPullProviderTask;

    beforeEach(() => {
        provider = createPullProviderMock();
        task = new BatchPullProviderTask(provider, "Phone");
    });

    it("should have a predictable name", () => {
        expect(task.name).toEqual("acquireMultiplePhoneGeolocation");
    });

    it("runs and generates an event with multiple measurements collected", async () => {
        spyOn(provider, "next").and.callFake(() => {
            return [
                new Promise((resolve) =>
                    setTimeout(() => resolve(createFakeGeolocation()), 200)
                ),
                () => null,
            ];
        });

        const igniter = createEvent("fake", {
            expirationTimestamp: Date.now() + 1000,
        });
        const done = listenToGeolocationAcquiredEvent(igniter.id);

        task.run({}, igniter);
        const acquiredData = await done;
        expect(acquiredData.length).toBe(4);
        for (let i = 0; i < 4; i++) {
            expect(acquiredData[i].type).toEqual(RecordType.Geolocation);
        }
    });

    it("allows to limit the frequency at which measurements should be collected at maximum", async () => {
        spyOn(provider, "next").and.callFake(() => {
            return [
                new Promise((resolve) =>
                    setTimeout(() => resolve(createFakeGeolocation()), 200)
                ),
                () => null,
            ];
        });

        const igniter = createEvent("fake", {
            expirationTimestamp: Date.now() + 1000,
        });
        const done = listenToGeolocationAcquiredEvent(igniter.id);

        task.run({ maxInterval: 400 }, igniter);
        const acquiredData = await done;
        expect(acquiredData.length).toBe(2);
        for (let i = 0; i < 2; i++) {
            expect(acquiredData[i].type).toEqual(RecordType.Geolocation);
        }
    });

    it("returns an empty list when the provider is not able to collect measurements", async () => {
        spyOn(provider, "next").and.callFake(() => {
            return [
                new Promise((_, reject) =>
                    setTimeout(() => reject("Could not get location!"), 200)
                ),
                () => null,
            ];
        });

        const igniter = createEvent("fake", {
            expirationTimestamp: Date.now() + 1000,
        });
        const done = listenToGeolocationAcquiredEvent(igniter.id);

        task.run({}, igniter);
        const acquiredData = await done;
        expect(acquiredData.length).toBe(0);
    });

    it("gracefully finishes when timeout rises", async () => {
        spyOn(provider, "next").and.callFake(() => {
            let interrupter = new ProviderInterrupter();
            const promise = new Promise<Geolocation>((resolve) => {
                const listenerId = setTimeout(
                    () => resolve(createFakeGeolocation()),
                    10000
                );
                interrupter.interruption = () => {
                    clearTimeout(listenerId);
                    resolve(null);
                };
            });

            return [promise, () => interrupter.interrupt()];
        });

        const igniter = createEvent("fake", {
            expirationTimestamp: Date.now() + 1000,
        });

        const runPromise = task.run({}, igniter);
        await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        task.cancel();
        await runPromise;
    });

    it("indicates the underlying provider to stop collecting data on cancel", async () => {
        const interrupter = jasmine.createSpy();
        spyOn(provider, "next").and.callFake(() => {
            return [
                new Promise((resolve) =>
                    setTimeout(
                        () => resolve(createFakeGeolocation()),

                        200
                    )
                ),
                interrupter,
            ];
        });

        const runPromise = task.run(
            {},
            createEvent("fake", { expirationTimestamp: Date.now() + 1000 })
        );
        await new Promise((resolve) => setTimeout(() => resolve(), 300));
        task.cancel();
        await runPromise;

        expect(interrupter).toHaveBeenCalled();
    });
});

function createFakeGeolocation(): Geolocation {
    return new Geolocation(0.0, 0.0, 0, 0, 0, 0, 0, new Date());
}

function listenToGeolocationAcquiredEvent(
    id: string
): Promise<Array<Geolocation>> {
    return new Promise((resolve) => {
        const listenerId = on("geolocationAcquired", (evt) => {
            if (evt.id === id) {
                off("geolocationAcquired", listenerId);
                resolve(evt.data as Array<Geolocation>);
            }
        });
    });
}
