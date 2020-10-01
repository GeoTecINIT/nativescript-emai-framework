/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { NavigatedData, Page } from "tns-core-modules/ui/page";
import {
    alert,
    AlertOptions,
    confirm,
    ConfirmOptions,
} from "@nativescript/core/ui/dialogs";

import { emaiFramework } from "nativescript-emai-framework";
import { ItemEventData } from "@nativescript/core";
import { HomeViewModel } from "~/home/home-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;

    page.bindingContext = getHomeViewModel();

    emitStartEvent()
        .then(() => {
            console.log("Start event emitted!");
        })
        .catch((err) => {
            console.error(`Could not emit start event: ${err}`);
        });
}

export function onNavigatedTo(args: NavigatedData) {
    const page = <Page>args.object;

    getHomeViewModel().onNotificationTap((notification) => {
        console.log(notification);
        const context = null;
        const closeCallback = null;
        const fullscreen = true;
        const animated = true;
        page.showModal("notification-handler/notification-handler-root", {
            context,
            closeCallback,
            fullscreen,
            animated,
        });
    });
}

export function onExportTap() {
    getHomeViewModel()
        .exportTraces()
        .then((result) => {
            const alertOptions: AlertOptions = {
                message: `Event log exported (${result.traceCount} exported)`,
                okButtonText: "OK",
            };
            return alert(alertOptions);
        })
        .catch((err) => {
            console.error(
                `Could not export records: ${err.stack ? err.stack : err}`
            );
        });
}

export function onClearEvents() {
    const confirmOptions: ConfirmOptions = {
        title: "Clear tracked events",
        message: "Are you sure you want to clear all your tracked events?",
        okButtonText: "Yes",
        cancelButtonText: "No",
    };
    confirm(confirmOptions).then((confirmed) => {
        if (confirmed) {
            getHomeViewModel().clearTraces();
        }
    });
}

export function onLoadMoreItems(args: ItemEventData) {
    console.log(`Loading more items...`);
    getHomeViewModel().loadMore();
}

async function emitStartEvent() {
    const isReady = await emaiFramework.isReady();
    if (!isReady) {
        const tasksNotReady = await emaiFramework.tasksNotReady$;
        console.log(
            `The following tasks are not ready!: ${JSON.stringify(
                tasksNotReady.map((task) => task.name)
            )}. Going to prepare them...`
        );
        await emaiFramework.prepare();
    }
    emaiFramework.emitEvent("startEvent");
}

let _vm: HomeViewModel;
function getHomeViewModel() {
    if (!_vm) {
        _vm = new HomeViewModel();
    }
    return _vm;
}
