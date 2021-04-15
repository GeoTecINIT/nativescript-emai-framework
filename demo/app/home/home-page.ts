/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import {
    alert,
    AlertOptions,
    confirm,
    ConfirmOptions,
    ItemEventData,
    NavigatedData,
    Page,
} from "@nativescript/core";

import { emaiFramework } from "@geotecinit/emai-framework";
import { HomeViewModel } from "./home-view-model";
import {
    TapActionType,
    Notification,
} from "@geotecinit/emai-framework/notifications";

import {
    AreaOfInterest,
    areasOfInterest,
} from "@geotecinit/emai-framework/entities/aois";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;

    page.bindingContext = getHomeViewModel();

    setupAreasOfInterest()
        .then(() => emitStartEvent())
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
        if (notification.tapAction.type === TapActionType.OPEN_APP) {
            return;
        }

        showNotificationModal(notification, page);
    });

    getHomeViewModel().onNotificationCleared((notification) => {
        console.log(`Notification with id ${notification.id} cleared`);
    });
}

export function onExportTap() {
    getHomeViewModel()
        .exportTraces()
        .then((result) => {
            const alertOptions: AlertOptions = {
                message: `Event log exported (${result.exportCount} exported)`,
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

async function setupAreasOfInterest() {
    console.log("Setting up areas of interest...");
    const aois = await areasOfInterest.getAll();

    const newAoIs: Array<AreaOfInterest> = [
        // Add your areas of interest here
    ];
    if (aois.length === newAoIs.length) {
        console.log("Areas already set up!");
        return;
    }
    await areasOfInterest.deleteAll();

    console.log(`Going to store ${newAoIs.length} new areas of interest`);
    await areasOfInterest.insert(newAoIs);
    console.log("Done setting up areas of interest!");
}

function showNotificationModal(notification: Notification, page: Page) {
    const context = notification;
    const closeCallback = null;
    const fullscreen = true;
    const animated = true;

    try {
        page.showModal("notification-handler/notification-handler-root", {
            context,
            closeCallback,
            fullscreen,
            animated,
        });
    } catch (err) {
        console.error(`Could not show modal: ${err}`);
    }
}

let _vm: HomeViewModel;
function getHomeViewModel() {
    if (!_vm) {
        _vm = new HomeViewModel();
    }
    return _vm;
}
