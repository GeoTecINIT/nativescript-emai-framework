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
        on("startEvent", run("startDetectingIntermediateHumanActivityChanges"));
        on("stopEvent", run("stopDetectingIntermediateHumanActivityChanges"));

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

        on("geolocationAcquired", run("logRecord"));
        on("userActivityChanged", run("logRecord"));
    }
}

export const demoTaskGraph = new DemoTaskGraph();
