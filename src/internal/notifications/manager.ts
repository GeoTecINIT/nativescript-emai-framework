import {
  simpleNotifications,
  ReceivedNotification,
} from "nativescript-simple-notifications";
import { Application, isAndroid } from "@nativescript/core";
import { taskDispatcher } from "nativescript-task-dispatcher";

import { Notification, TapActionType } from "./notification";
import {
  NotificationsStore,
  notificationsStoreDB,
} from "../persistence/stores/notifications";
import { getLogger, Logger } from "../utils/logger";
import { EventData } from "nativescript-task-dispatcher/events";
import { extractIdAndActionFrom } from "./index";
import { NotificationTapRecord } from "../tasks/notifications/notification-tap";
import { NotificationDiscardRecord } from "../tasks/notifications/notification-discard";

const DEFAULT_CHANNEL_NAME = "Mobile interventions";

export interface NotificationsManager {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  display(notification: Notification): Promise<void>;
}

export interface NotificationActionsManager {
  listenToNotificationTaps(): Promise<void>;
  getLastUnhandledNotification(): Notification;
  onNotificationCleared(clearCallback: NotificationCallback): Promise<void>;
  markAsSeen(notificationId: number): Promise<void>;
}

const NOTIFICATION_TAPPED_EVENT = "notificationTapped";
const NOTIFICATION_CLEARED_EVENT = "notificationCleared";

class NotificationsManagerImpl
  implements NotificationsManager, NotificationActionsManager {
  private initialized: boolean;
  private lastUnhandledNotification: Notification;

  private logger: Logger;

  constructor(
    private store: NotificationsStore,
    private emitEvent: (eventName: string, eventData?: EventData) => void
  ) {
    this.logger = getLogger("NotificationsManager");
  }

  private channelName = DEFAULT_CHANNEL_NAME;

  public hasPermission(): Promise<boolean> {
    return simpleNotifications.hasPermission();
  }

  public requestPermission(): Promise<boolean> {
    return simpleNotifications.requestPermission();
  }

  public async display(notification: Notification): Promise<void> {
    const { id, title, body, bigTextStyle } = notification;

    await this.store.insert(notification);

    if (isAndroid) {
      this.fixAndroidChannel();
    }
    await simpleNotifications.schedule([
      {
        id,
        title,
        body,
        bigTextStyle,
        channel: this.channelName,
        forceShowWhenInForeground: true,
        priority: 2,
      },
    ]);
  }

  public setChannelName(name: string) {
    this.channelName = name;
  }

  public listenToNotificationTaps(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    this.initialized = true;

    return simpleNotifications.addOnMessageReceivedCallback((received) =>
      this.processReceivedNotification(received)
        .then((notification) => {
          const { id, tapAction } = extractIdAndActionFrom(notification);
          this.emitEvent(
            NOTIFICATION_TAPPED_EVENT,
            new NotificationTapRecord(id, tapAction)
          );
          this.lastUnhandledNotification = notification;
        })
        .catch((err) => this.logger.error(err))
    );
  }

  public getLastUnhandledNotification(): Notification {
    if (!this.lastUnhandledNotification) return null;
    const notification = this.lastUnhandledNotification;
    this.lastUnhandledNotification = undefined;
    return notification;
  }

  public onNotificationCleared(
    clearCallback: NotificationCallback
  ): Promise<void> {
    return simpleNotifications.addOnMessageClearedCallback((received) =>
      this.processReceivedNotification(received)
        .then((notification) => {
          const { id, tapAction } = extractIdAndActionFrom(notification);
          this.emitEvent(
            NOTIFICATION_CLEARED_EVENT,
            new NotificationDiscardRecord(id, tapAction)
          );
          clearCallback(notification);
        })
        .catch((err) => this.logger.error(err))
    );
  }

  public async markAsSeen(notificationId: number): Promise<void> {
    await this.store.delete(notificationId);
  }

  private async processReceivedNotification(
    received: ReceivedNotification
  ): Promise<Notification> {
    const { id } = received;
    const notification = await this.store.get(id);
    if (notification.tapAction.type === TapActionType.OPEN_APP) {
      await this.markAsSeen(id);
    }
    return notification;
  }

  private fixAndroidChannel() {
    if (
      typeof android === "undefined" ||
      android.os.Build.VERSION.SDK_INT < 26
    ) {
      return;
    }
    const notificationManager = Application.android.context.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    );
    if (
      !notificationManager ||
      !!notificationManager.getNotificationChannel(this.channelName)
    ) {
      return;
    }
    const channel = new android.app.NotificationChannel(
      this.channelName,
      this.channelName,
      android.app.NotificationManager.IMPORTANCE_HIGH
    );
    channel.enableLights(true);
    channel.setLightColor(android.graphics.Color.BLUE);
    channel.enableVibration(true);
    channel.setVibrationPattern([0, 1000, 500, 1000]);
    notificationManager.createNotificationChannel(channel);
  }
}

export type NotificationCallback = (notification: Notification) => void;

export const notificationsManager = new NotificationsManagerImpl(
  notificationsStoreDB,
  taskDispatcher.emitEvent
);
