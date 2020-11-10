import { Task } from "nativescript-task-dispatcher/tasks";
import { EventTrackerTask } from "./event-tracker";

export { Trace } from "./trace";
export { TraceType } from "./trace-type";
export { TraceResult } from "./trace-result";
export { TraceableTask } from "./traceable-task";
export { TracerConfig } from "./tracer-config";

export const tracingTasks: Array<Task> = [
  new EventTrackerTask("trackEvent"),
  new EventTrackerTask("trackSensitiveEvent", {
    sensitiveData: true,
  }),
];
