import { dataCollectionTasks } from "./data-collection";
import { Task } from "nativescript-task-dispatcher/tasks";
import { EventPrinterTask } from "./event-printer";

export const builtInTasks: Array<Task> = [
  ...dataCollectionTasks,
  new EventPrinterTask("printInvocationEvent"),
];
