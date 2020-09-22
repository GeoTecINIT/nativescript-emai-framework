import { TracesStore } from "nativescript-emai-framework/internal/persistence/stores/traces";
import { Trace } from "nativescript-emai-framework/internal/tasks/tracing";
import { Observable, of } from "rxjs";

export function createTracesStoreMock(): TracesStore {
    return {
        insert(trace: Trace): Promise<void> {
            return Promise.resolve();
        },
        list(size?: number): Observable<Array<Trace>> {
            return of([]);
        },
        getAll(): Promise<Array<Trace>> {
            return Promise.resolve([]);
        },
        clear(): Promise<void> {
            return Promise.resolve();
        },
    };
}
