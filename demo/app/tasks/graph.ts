import {
    TaskGraph,
    EventListenerGenerator,
    RunnableTaskDescriptor,
} from "nativescript-emai-framework/tasks";
import { TapContentType } from "nativescript-emai-framework/internal/notifications";

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

        // on("geolocationAcquired", run("writeRecord"));
        // on("userActivityChanged", run("writeRecord"));
        on("userActivityChanged", run("trackEvent"));

        on(
            "userStartedWalking",
            run("sendNotification", {
                title: "New content available",
                body: "This information may be valuable for you",
                tapContent: {
                    type: TapContentType.RICH_TEXT,
                    id: "rtc1",
                },
            })
        );

        on(
            "userFinishedWalking",
            run("sendNotification", {
                title: "May I ask you some questions?",
                body: "This will allow me know better what you feel",
                tapContent: {
                    type: TapContentType.QUESTIONS,
                    id: "qs1",
                },
            })
        );

        on("questionsAnswered", run("trackEvent"));
    }
}

export const demoTaskGraph = new DemoTaskGraph();
