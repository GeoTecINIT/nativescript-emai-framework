import {
    ActivityRecognizer,
    RecognitionCallback,
    StartOptions,
} from "nativescript-context-apis/internal/activity-recognition";

export function createActivityRecognizerMock(): ActivityRecognizer {
    return {
        setup(): Promise<void> {
            return Promise.resolve();
        },
        isReady(): boolean {
            return false;
        },
        prepare(): Promise<void> {
            return Promise.resolve();
        },
        startRecognizing(options?: StartOptions): Promise<void> {
            return Promise.resolve();
        },
        stopRecognizing(): Promise<void> {
            return Promise.resolve();
        },
        listenActivityChanges(callback: RecognitionCallback): number {
            return 0;
        },
        stopListening(listenerId?: number) {},
    };
}
