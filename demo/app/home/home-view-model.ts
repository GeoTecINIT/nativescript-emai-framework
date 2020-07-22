import { Observable } from "tns-core-modules/data/observable";
import { Record } from "nativescript-emai-framework/internal/providers/base-record";

import {
    RecordsStore,
    recordsStoreDB,
} from "nativescript-emai-framework/internal/persistence/stores/records";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { Subject, Subscription } from "rxjs";

import {
    RecordsExportResult,
    createRecordsExporter,
} from "nativescript-emai-framework/internal/persistence/file/records-exporter";

const SIZE_INCREMENT = 10;

const EXPORT_FOLDER = "Record logs";

export class HomeViewModel extends Observable {
    private _records = [];
    private _size = 0;

    private _exportingRecords = false;

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

    get exportingRecords() {
        return this._exportingRecords;
    }

    loadMore() {
        this._size += SIZE_INCREMENT;
        this._fetchOrders.next(this._size);
    }

    exportRecords(): Promise<RecordsExportResult> {
        this.toggleExportingRecords(true);
        return createRecordsExporter(EXPORT_FOLDER)
            .export()
            .then((result) => {
                this.toggleExportingRecords(false);
                return result;
            })
            .catch((err) => {
                this.toggleExportingRecords(false);
                return err;
            });
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
                this._records = records;
                this.notifyPropertyChange("records", records);
            },
            (err) => console.error(`Error loading records: ${err}`)
        );
    }

    private toggleExportingRecords(value: boolean) {
        this._exportingRecords = value;
        this.notifyPropertyChange("exportingRecords", value);
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
