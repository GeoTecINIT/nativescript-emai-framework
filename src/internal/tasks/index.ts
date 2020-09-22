import { dataCollectionTasks } from "./data-collection";
import { Task } from "nativescript-task-dispatcher/tasks";
import { RecordLoggerTask } from "./record-logger";

export const builtInTasks: Array<Task> = [
  ...dataCollectionTasks,
  new RecordLoggerTask("writeRecord"),
];
