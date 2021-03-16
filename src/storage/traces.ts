export { Trace, TraceType, TraceResult } from "../internal/tasks/tracing";

import {syncedTracesStore, TracesStore} from "../internal/persistence/stores/timeseries";

export {TracesStore};
export const tracesStore: TracesStore = syncedTracesStore;
