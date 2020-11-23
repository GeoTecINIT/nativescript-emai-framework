import { NotificationsManager } from "@geotecinit/emai-framework/internal/notifications/manager";
import { Notification } from "@geotecinit/emai-framework/internal/notifications";

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
