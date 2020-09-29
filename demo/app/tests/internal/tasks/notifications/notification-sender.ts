import { NotificationsManager } from "nativescript-emai-framework/internal/notifications/manager";
import { createNotificationsManagerMock } from "./index";
import { NotificationSenderTask } from "nativescript-emai-framework/internal/tasks/notifications/notification-sender";

describe("Notification sender task", () => {
    let manager: NotificationsManager;
    let notificationSender: NotificationSenderTask;

    beforeEach(() => {
        manager = createNotificationsManagerMock();
        notificationSender = new NotificationSenderTask(
            "sendNotification",
            {},
            manager
        );

        spyOn(manager, "display");
    });

    it("is able to check if notification permission has been granted", async () => {
        spyOn(manager, "hasPermission").and.returnValue(Promise.resolve(true));

        await notificationSender.checkIfCanRun();
        expect(manager.hasPermission).toHaveBeenCalled();
    });

    it("throws an error if notification permission has not been granted", async () => {
        spyOn(manager, "hasPermission").and.returnValue(Promise.resolve(false));

        await expectAsync(
            notificationSender.checkIfCanRun()
        ).toBeRejectedWithError("Notification permission has not been granted");
    });

    it("can ask the native notification mechanism to ask for a missing notification permission", async () => {
        spyOn(manager, "hasPermission").and.returnValue(Promise.resolve(false));
        spyOn(manager, "requestPermission").and.returnValue(
            Promise.resolve(true)
        );

        await notificationSender.prepare();
        expect(manager.hasPermission).toHaveBeenCalled();
        expect(manager.requestPermission).toHaveBeenCalled();
    });

    it("throws an error it the notification permission has been denied", async () => {
        spyOn(manager, "hasPermission").and.returnValue(Promise.resolve(false));
        spyOn(manager, "requestPermission").and.returnValue(
            Promise.resolve(false)
        );

        await expectAsync(notificationSender.prepare()).toBeRejectedWithError(
            "Notification permission has not been granted"
        );
    });

    it("does not ask for a missing notification permission if it has already been granted", async () => {
        spyOn(manager, "hasPermission").and.returnValue(Promise.resolve(true));
        spyOn(manager, "requestPermission");

        await notificationSender.prepare();
        expect(manager.hasPermission).toHaveBeenCalled();
        expect(manager.requestPermission).not.toHaveBeenCalled();
    });
});
