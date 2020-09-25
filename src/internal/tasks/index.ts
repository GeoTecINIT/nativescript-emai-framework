import { Task } from "nativescript-task-dispatcher/tasks";
import { dataCollectionTasks } from "./data-collection";
import { tracingTasks } from "./tracing";
import { RecordWriterTask } from "./record-logger";

export const builtInTasks: Array<Task> = [
  ...dataCollectionTasks,
  ...tracingTasks,
  new RecordWriterTask("writeRecord"),
];
