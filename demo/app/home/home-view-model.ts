import { knownFolders, Observable } from "@nativescript/core";

import { Subject, Subscription } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";

import {
    Trace,
    TracesStore,
    tracesStore,
} from "@geotecinit/emai-framework/storage/traces";

import {
    ExportResult,
    createTracesExporter,
} from "@geotecinit/emai-framework/storage/exporters";

import {
    notificationsManager,
    Notification,
} from "@geotecinit/emai-framework/notifications";

const SIZE_INCREMENT = 10;

const EXPORT_FOLDER = knownFolders.documents().getFolder("Record logs");

export class HomeViewModel extends Observable {
    private _traces = [];
    private _size = 0;

    private _exportingTraces = false;

    private _fetchOrders: Subject<number>;
    private _subscription: Subscription;

    constructor(private store: TracesStore = tracesStore) {
        super();
        this.subscribeToDatabaseChanges();
        this.loadMore();
    }

    get traces() {
        return this._traces;
    }

    get exportingTraces() {
        return this._exportingTraces;
    }

    loadMore() {
        this._size += SIZE_INCREMENT;
        this._fetchOrders.next(this._size);
    }

    exportTraces(): Promise<ExportResult> {
        this.toggleExportingTraces(true);
        return createTracesExporter(EXPORT_FOLDER)
            .export()
            .then((result) => {
                this.toggleExportingTraces(false);
                return result;
            })
            .catch((err) => {
                this.toggleExportingTraces(false);
                return err;
            });
    }

    clearTraces() {
        console.warn("Up to clear traces!");
        this.store.clear();
    }

    onNotificationTapped(cb: (notification: Notification) => void) {
        notificationsManager
            .onNotificationTap(cb)
            .catch((err) =>
                console.error(
                    `Could not subscribe to notification taps. Reason: ${err}`
                )
            );
    }

    onNotificationCleared(cb: (notification: Notification) => void) {
        notificationsManager
            .onNotificationCleared(cb)
            .catch((err) =>
                console.error(
                    `Could not subscribe to notification clears. Reason: ${err}`
                )
            );
    }

    private subscribeToDatabaseChanges() {
        this._fetchOrders = new Subject<number>();

        const listTraces = (size: number) =>
            this.store
                .list(size)
                .pipe(map((traces) => traces.map(formatTrace)));

        const stream = this._fetchOrders.pipe(
            debounceTime(1000),
            switchMap(listTraces)
        );

        this._subscription = stream.subscribe(
            (traces) => {
                this._traces = traces;
                this.notifyPropertyChange("traces", traces);
            },
            (err) => console.error(`Error loading traces: ${err}`)
        );
    }

    private toggleExportingTraces(value: boolean) {
        this._exportingTraces = value;
        this.notifyPropertyChange("exportingTraces", value);
    }
}

function formatTrace(trace: Trace) {
    return {
        ...trace,
        timestamp: timestampFormatter(trace.timestamp),
    };
}

function timestampFormatter(t: Date) {
    const day = twoDigits(t.getDate());
    const month = twoDigits(t.getMonth() + 1);
    const year = t.getFullYear();
    const hour = twoDigits(t.getHours());
    const minutes = twoDigits(t.getMinutes());
    const seconds = twoDigits(t.getSeconds());

    return `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;
}

function twoDigits(num: number): String {
    return `0${num}`.slice(-2);
}
