import { LocalNotifications } from "nativescript-local-notifications";
import { android as androidApp } from "tns-core-modules/application";

import { Notification } from "./notification";

const DEFAULT_CHANNEL_NAME = "Mobile interventions";

export interface NotificationsManager {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  display(notification: Notification): Promise<void>;
}

class NotificationsManagerImpl implements NotificationsManager {
  private channelName = DEFAULT_CHANNEL_NAME;

  public hasPermission(): Promise<boolean> {
    return LocalNotifications.hasPermission();
  }

  public requestPermission(): Promise<boolean> {
    return LocalNotifications.requestPermission();
  }

  public async display(notification: Notification): Promise<void> {
    const { title, body, bigTextStyle } = notification;

    this.fixAndroidChannel();
    await LocalNotifications.schedule([
      {
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
      tapCallback()
    );
  }

  public onNotificationCleared(
    clearCallback: NotificationCallback
  ): Promise<void> {
    return LocalNotifications.addOnMessageClearedCallback((received) =>
      clearCallback()
    );
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
}

export type NotificationCallback = () => void;

export const notificationsManager = new NotificationsManagerImpl();
