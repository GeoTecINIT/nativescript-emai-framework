import { Task } from "nativescript-task-dispatcher/tasks";
import { dataCollectionTasks } from "./data-collection";
import { notificationTasks } from "./notifications";
import { tracingTasks } from "./tracing";
import { RecordWriterTask } from "./record-logger";

export const builtInTasks: Array<Task> = [
  ...dataCollectionTasks,
  ...notificationTasks,
  ...tracingTasks,
  new RecordWriterTask("writeRecord"),
];
