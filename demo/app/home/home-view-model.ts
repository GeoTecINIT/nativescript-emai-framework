import { Observable } from "tns-core-modules/data/observable";
import { Record } from "nativescript-emai-framework/internal/providers/base-record";

import {
    RecordsStore,
    recordsStoreDB,
} from "nativescript-emai-framework/internal/persistence/stores/records";
import { map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { ObservableArray } from "@nativescript/core";

const LOAD_INCREMENT = 1000;

export class HomeViewModel extends Observable {
    private _records = new ObservableArray([]);
    private _size = 0;
    private _subscription: Subscription;

    constructor(private store: RecordsStore = recordsStoreDB) {
        super();
        this.loadMore();
    }

    get records() {
        return this._records;
    }

    loadMore() {
        this._size += LOAD_INCREMENT;
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
        this.onLoadMore();
    }

    private onLoadMore() {
        this._subscription = this.store
            .list(this._size)
            .pipe(map((records) => records.map(formatRecord)))
            .subscribe(
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
