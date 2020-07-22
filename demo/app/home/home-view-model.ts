import { Observable } from "tns-core-modules/data/observable";
import { Record } from "nativescript-emai-framework/internal/providers/base-record";

import {
    RecordsStore,
    recordsStoreDB,
} from "nativescript-emai-framework/internal/persistence/stores/records";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { Subject, Subscription } from "rxjs";
import { ObservableArray } from "@nativescript/core";

const SIZE_INCREMENT = 10;

export class HomeViewModel extends Observable {
    private _records = new ObservableArray([]);
    private _size = 0;

    private _fetchOrders: Subject<number>;
    private _subscription: Subscription;

    constructor(private store: RecordsStore = recordsStoreDB) {
        super();
        this.subscribeToDatabaseChanges();
        this.loadMore();
    }

    get records() {
        return this._records;
    }

    loadMore() {
        this._size += SIZE_INCREMENT;
        this._fetchOrders.next(this._size);
    }

    clearRecords() {
        console.warn("Up to clear records!");
        this.store.clear();
    }

    private subscribeToDatabaseChanges() {
        this._fetchOrders = new Subject<number>();

        const listRecords = (size: number) =>
            this.store
                .list(size)
                .pipe(map((records) => records.map(formatRecord)));

        const stream = this._fetchOrders.pipe(
            debounceTime(1000),
            switchMap(listRecords)
        );

        this._subscription = stream.subscribe(
            (records) => {
                this._records = new ObservableArray(records);
                this.notifyPropertyChange("records", records);
            },
            (err) => console.error(`Error loading records: ${err}`)
        );
    }
}

function formatRecord(record: Record) {
    return {
        ...record,
        timestamp: timestampFormatter(record.timestamp),
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
