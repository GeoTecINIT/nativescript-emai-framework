import { PushProvider } from "@geotecinit/emai-framework/internal/providers";
import { StartPushProviderTask } from "@geotecinit/emai-framework/internal/tasks/data-collection/push-based";
import { createPushProviderMock } from "~/tests/internal/tasks/data-collection/push-based/index";
import { createEvent } from "nativescript-task-dispatcher/testing/events";

describe("Start push provider task", () => {
    let provider: PushProvider;
    let task: StartPushProviderTask;

    beforeEach(() => {
        provider = createPushProviderMock();
        task = new StartPushProviderTask(provider, "Intermediate");
    });

    it("should have a predictable name", () => {
        expect(task.name).toEqual(
            "startDetectingIntermediateHumanActivityChanges"
        );
    });

    it("should indicate the underlying provider to start providing on task run", async () => {
        spyOn(provider, "startProviding").and.returnValue(Promise.resolve());
        await task.run({}, createEvent("fake"));
        expect(provider.startProviding).toHaveBeenCalled();
    });

    it("should propagate any error raised on provider start", async () => {
        spyOn(provider, "startProviding").and.returnValue(
            Promise.reject("Start error")
        );
        await expectAsync(task.run({}, createEvent("fake"))).toBeRejectedWith(
            "Start error"
        );
    });
});
