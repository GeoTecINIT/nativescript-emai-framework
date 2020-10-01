import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";
import { EventData, fromObject } from "tns-core-modules/data/observable";
import { getNotificationHandlerService } from "~/notification-handler/notification-handler-service";

export function onNavigatedTo(args: EventData) {
    const context = getNotificationHandlerService().tappedNotification;
    const page: Page = <Page>args.object;
    page.bindingContext = fromObject(context);
}

export function closeModal(args: EventData) {
    const view: View = <View>args.object;
    view.closeModal();
}
