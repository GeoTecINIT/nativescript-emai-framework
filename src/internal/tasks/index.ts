import { dataCollectionTasks } from "./data-collection";
import { Task } from "nativescript-task-dispatcher/tasks";
import { RecordWriterTask } from "./record-logger";
import { EventTrackerTask } from "./tracing/event-tracker";

export const builtInTasks: Array<Task> = [
  ...dataCollectionTasks,
  new EventTrackerTask("trackEvent"),
  new RecordWriterTask("writeRecord"),
];
