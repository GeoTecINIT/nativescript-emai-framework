import { View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";
import { Slider } from "tns-core-modules/ui/slider";
import { EventData } from "tns-core-modules/data/observable";
import { getNotificationHandlerService } from "~/notification-handler/notification-handler-service";
import { NotificationViewModel } from "./notification-view-model";

let vm: NotificationViewModel;

export function onNavigatingTo(args: EventData) {
    const context = getNotificationHandlerService().tappedNotification;
    const page: Page = <Page>args.object;
    vm = new NotificationViewModel(context);
    page.bindingContext = vm;
}

export function onSliderLoaded(args: EventData) {
    let slider = <Slider>args.object;
    slider.on("valueChange", (args) => {
        slider = <Slider>args.object;
        if (vm.answers.length === 0) {
            vm.answers.push(slider.value);
        } else {
            vm.answers[0] = slider.value;
        }
    });
}

export function submit(args: EventData) {
    vm.submitAnswers();
    closeModal(args);
}

export function closeModal(args: EventData) {
    const view: View = <View>args.object;
    view.closeModal();
}