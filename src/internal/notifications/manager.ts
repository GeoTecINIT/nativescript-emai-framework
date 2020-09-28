import { LocalNotifications } from "nativescript-local-notifications";
import { Blue } from "tns-core-modules/color/known-colors";

import { Notification } from "./notification";

// TODO: Parameterize this
const CHANNEL_NAME = "Mobile interventions";

class NotificationsManager {
  public hasPermission(): Promise<boolean> {
    return LocalNotifications.hasPermission();
  }

  public requestPermission(): Promise<boolean> {
    return LocalNotifications.requestPermission();
  }

  public async display(notification: Notification): Promise<void> {
    const { title, body, bigTextStyle } = notification;
    const ids = await LocalNotifications.schedule([
      {
        title,
        body,
        bigTextStyle,
        channel: CHANNEL_NAME,
        forceShowWhenInForeground: true,
        priority: 2,
        notificationLed: Blue,
      },
    ]);

    console.log(`Notification successfully displayed with id: ${ids[0]}`);
  }
}

export const notificationsManager = new NotificationsManager();
