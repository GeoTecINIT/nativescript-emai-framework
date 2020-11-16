import { ShownModallyData } from "tns-core-modules/ui/core/view";
import { Notification } from "nativescript-emai-framework/notifications";
import { getNotificationHandlerService } from "~/notification-handler/notification-handler-service";

export function onShownModally(args: ShownModallyData) {
    getNotificationHandlerService().tappedNotification = <Notification>(
        args.context
    );
}
