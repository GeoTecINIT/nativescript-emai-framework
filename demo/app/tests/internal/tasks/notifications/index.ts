import { NotificationsManager } from "nativescript-emai-framework/internal/notifications/manager";
import { Notification } from "nativescript-emai-framework/internal/notifications";

export function createNotificationsManagerMock(): NotificationsManager {
    return {
        hasPermission() {
            return Promise.resolve(true);
        },
        requestPermission() {
            return Promise.resolve(true);
        },
        display(notification: Notification) {
            return Promise.resolve();
        },
    };
}
