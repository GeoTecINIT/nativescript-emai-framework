import { PushProvider } from "@geotecinit/emai-framework/internal/providers";
import { RecordType } from "@geotecinit/emai-framework/internal/providers/base-record";

export function createPushProviderMock(): PushProvider {
    return {
        get provides() {
            return RecordType.HumanActivity;
        },
        checkIfIsReady() {
            return Promise.resolve();
        },
        prepare() {
            return Promise.resolve();
        },
        startProviding() {
            return Promise.resolve();
        },
        stopProviding() {
            return Promise.resolve();
        },
    };
}
