import { Notification } from "nativescript-emai-framework/internal/notifications";

class NotificationHandlerService {
    private _tappedNotification: Notification;

    get tappedNotification(): Notification {
        return this._tappedNotification;
    }

    set tappedNotification(notification: Notification) {
        this._tappedNotification = notification;
    }
}

let _service: NotificationHandlerService;
export function getNotificationHandlerService() {
    if (!_service) {
        _service = new NotificationHandlerService();
    }
    return _service;
}
