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

        on(
            "geolocationAcquired",
            run("checkAreaOfInterestProximity", { nearbyRange: 100 })
        );

        on(
            "movedCloseToAreaOfInterest",
            run("sendNotification", { title: "You've moved close to an AoI!" })
        );
        on(
            "movedCloseToAreaOfInterest",
            run("acquireMultiplePhoneGeolocation")
                .every(1, "minutes")
                .cancelOn("movedAwayFromAreaOfInterest")
        );

        on(
            "movedInsideAreaOfInterest",
            run("sendNotification", { title: "You've moved inside an AoI!" })
        );
        on(
            "movedInsideAreaOfInterest",
            run("sendNotification", {
                title: "May I ask you some questions?",
                body: "This will allow me know better what you feel",
                tapContent: {
                    type: TapContentType.QUESTIONS,
                    id: "qs1",
                },
            })
                .every(1, "minutes")
                .cancelOn("movedOutsideAreaOfInterest")
        );
        on("questionsAnswered", run("trackEvent"));

        on(
            "movedOutsideAreaOfInterest",
            run("sendNotification", { title: "You've moved outside an AoI!" })
        );
        on(
            "movedOutsideAreaOfInterest",
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
            "movedAwayFromAreaOfInterest",
            run("sendNotification", { title: "You've moved away from an AoI!" })
        );

        on("userActivityChanged", run("trackEvent"));
        // on("geolocationAcquired", run("writeRecord"));
        // on("userActivityChanged", run("writeRecord"));
    }
}

export const demoTaskGraph = new DemoTaskGraph();
