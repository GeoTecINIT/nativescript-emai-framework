import { Observable } from "tns-core-modules/data/observable";

import { ConfigParams } from "nativescript-task-dispatcher/task-dispatcher.common";
import { Task, TaskGraph } from "./tasks";
import { HumanActivityProvider } from "./internal/providers/activity-recognition/provider";
import { taskDispatcher } from "nativescript-task-dispatcher";
import { contextApis } from "nativescript-context-apis";
import { EventData } from "./events";
import { builtInTasks } from "./internal/tasks";

export class Common extends Observable {
  async init(
    appTasks: Array<Task>,
    appTaskGraph: TaskGraph,
    config: ConfigParams = {}
  ): Promise<void> {
    await taskDispatcher.init(
      [...builtInTasks, ...appTasks],
      appTaskGraph,
      config
    );
    this.initializeListeners();
    await contextApis.init();
  }

  isReady(): Promise<boolean> {
    return taskDispatcher.isReady();
  }

  get tasksNotReady$(): Promise<Array<Task>> {
    return taskDispatcher.tasksNotReady;
  }

  prepare(): Promise<void> {
    return taskDispatcher.prepare();
  }

  emitEvent(eventName: string, eventData: EventData = {}): void {
    taskDispatcher.emitEvent(eventName, eventData);
  }

  initializeListeners() {
    HumanActivityProvider.setup();
  }
}

export { ConfigParams } from "nativescript-task-dispatcher/task-dispatcher.common";
