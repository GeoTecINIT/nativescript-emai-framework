import { ActivityRecognizer } from "nativescript-context-apis/internal/activity-recognition";
import { HumanActivityProvider } from "@geotecinit/emai-framework/internal/providers/activity-recognition/provider";
import { createActivityRecognizerMock } from "./index";
import { HumanActivityRecognizerNotReadyErr } from "@geotecinit/emai-framework/internal/providers/activity-recognition/provider";
import { Resolution } from "@geotecinit/emai-framework/internal/providers/activity-recognition/provider";

describe("Human activity provider", () => {
    let nativeRecognizer: ActivityRecognizer;
    let provider: HumanActivityProvider;

    beforeEach(() => {
        nativeRecognizer = createActivityRecognizerMock();
        provider = new HumanActivityProvider(
            Resolution.MEDIUM,
            1000,
            (resolution) => {
                if (resolution !== Resolution.MEDIUM) return null;
                return nativeRecognizer;
            }
        );
    });

    it("allows to check if the underlying provider is ready", async () => {
        spyOn(nativeRecognizer, "isReady").and.returnValue(true);
        await provider.checkIfIsReady();
        expect(nativeRecognizer.isReady).toHaveBeenCalled();
    });
    it("throws an error if the underlying provider is not ready", async () => {
        spyOn(nativeRecognizer, "isReady").and.returnValue(false);
        await expectAsync(provider.checkIfIsReady()).toBeRejectedWith(
            new HumanActivityRecognizerNotReadyErr(Resolution.MEDIUM)
        );
    });
    it("allows to prepare the underlying provider", async () => {
        spyOn(nativeRecognizer, "prepare").and.returnValue(Promise.resolve());
        await provider.prepare();
        expect(nativeRecognizer.prepare).toHaveBeenCalled();
    });
    it("instructs the underlying provider to listen for updates", async () => {
        spyOn(nativeRecognizer, "startRecognizing").and.returnValue(
            Promise.resolve()
        );
        await provider.startProviding();
        expect(nativeRecognizer.startRecognizing).toHaveBeenCalledWith({
            detectionInterval: 1000,
        });
    });
    it("instructs the underlying provider to stop listening for updates", async () => {
        spyOn(nativeRecognizer, "stopRecognizing").and.returnValue(
            Promise.resolve()
        );
        await provider.stopProviding();
        expect(nativeRecognizer.stopRecognizing).toHaveBeenCalled();
    });
});
