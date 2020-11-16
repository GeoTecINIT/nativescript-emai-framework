export { Notification, TapContentType } from "../internal/notifications";

import {
  notificationsManager as nm,
  NotificationActionsManager,
  NotificationCallback,
} from "../internal/notifications/manager";
export { NotificationActionsManager, NotificationCallback };

export const notificationsManager: NotificationActionsManager = nm;
