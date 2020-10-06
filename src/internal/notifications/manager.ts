import {
  LocalNotifications,
  ReceivedNotification,
} from "nativescript-local-notifications";
import { android as androidApp } from "tns-core-modules/application";

import { Notification } from "./notification";
import {
  NotificationsStore,
  notificationsStoreDB,
} from "../persistence/stores/notifications";
import { getLogger, Logger } from "../utils/logger";

const DEFAULT_CHANNEL_NAME = "Mobile interventions";

export interface NotificationsManager {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  display(notification: Notification): Promise<void>;
}

class NotificationsManagerImpl implements NotificationsManager {
  private logger: Logger;

  constructor(private store: NotificationsStore) {
    this.logger = getLogger("NotificationsManager");
  }

  private channelName = DEFAULT_CHANNEL_NAME;

  public hasPermission(): Promise<boolean> {
    return LocalNotifications.hasPermission();
  }

  public requestPermission(): Promise<boolean> {
    return LocalNotifications.requestPermission();
  }

  public async display(notification: Notification): Promise<void> {
    const { title, body, bigTextStyle } = notification;

    const id = NotificationsManagerImpl.generateNotificationId();
    await this.store.insert(id, notification);

    this.fixAndroidChannel();
    await LocalNotifications.schedule([
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

  public onNotificationTap(tapCallback: NotificationCallback): Promise<void> {
    return LocalNotifications.addOnMessageReceivedCallback((received) =>
      this.processReceivedNotification(received)
        .then((notification) => tapCallback(notification))
        .catch((err) => this.logger.error(err))
    );
  }

  public onNotificationCleared(
    clearCallback: NotificationCallback
  ): Promise<void> {
    return LocalNotifications.addOnMessageClearedCallback((received) =>
      this.processReceivedNotification(received)
        .then((notification) => clearCallback(notification))
        .catch((err) => this.logger.error(err))
    );
  }

  private async processReceivedNotification(
    received: ReceivedNotification
  ): Promise<Notification> {
    const { id } = received;
    const notification = await this.store.get(id);
    await this.store.delete(id);
    return notification;
  }

  private fixAndroidChannel() {
    if (
      typeof android === "undefined" ||
      android.os.Build.VERSION.SDK_INT < 26
    ) {
      return;
    }
    const notificationManager = androidApp.context.getSystemService(
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

  private static generateNotificationId(): number {
    // From nativescript-local-notifications
    // https://github.com/EddyVerbruggen/nativescript-local-notifications/blob/master/src/local-notifications-common.ts
    return Math.round((Date.now() + Math.round(100000 * Math.random())) / 1000);
  }
}

export type NotificationCallback = (notification: Notification) => void;

export const notificationsManager = new NotificationsManagerImpl(
  notificationsStoreDB
);