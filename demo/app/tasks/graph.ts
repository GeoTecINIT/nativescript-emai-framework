import {
    TaskGraph,
    EventListenerGenerator,
    RunnableTaskDescriptor,
} from "nativescript-emai-framework/tasks";

class DemoTaskGraph implements TaskGraph {
    async describe(
        on: EventListenerGenerator,
        run: RunnableTaskDescriptor
    ): Promise<void> {
        on("startEvent", run("startDetectingCoarseHumanActivityChanges"));
        on("stopEvent", run("stopDetectingCoarseHumanActivityChanges"));

        on(
            "startEvent",
            run("acquirePhoneGeolocation")
                .every(5, "minutes")
                .cancelOn("userFinishedBeingStill")
        );
        on(
            "userStartedBeingStill",
            run("acquirePhoneGeolocation")
                .every(5, "minutes")
                .cancelOn("userFinishedBeingStill")
        );

        on(
            "userFinishedBeingStill",
            run("acquirePhoneGeolocation")
                .every(1, "minutes")
                .cancelOn("userStartedBeingStill")
        );

        on("geolocationAcquired", run("writeRecord"));
        on("userActivityChanged", run("writeRecord"));
    }
}

export const demoTaskGraph = new DemoTaskGraph();
