import { ShownModallyData } from "@nativescript/core";
import { Notification } from "@geotecinit/emai-framework/notifications";
import { getNotificationHandlerService } from "~/notification-handler/notification-handler-service";

export function onShownModally(args: ShownModallyData) {
    const notification = <Notification>args.context;
    const tappingTimestamp = new Date().getTime();
    getNotificationHandlerService().tappedNotification = {
        ...notification,
        tappingTimestamp,
    };
}
