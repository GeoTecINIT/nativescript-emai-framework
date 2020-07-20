import { Observable } from "tns-core-modules/data/observable";

import { ConfigParams } from "nativescript-task-dispatcher/task-dispatcher.common";
import { Task, TaskGraph } from "./tasks";
import { HumanActivityProvider } from "./internal/providers/activity-recognition/provider";
import { taskDispatcher } from "nativescript-task-dispatcher";
import { contextApis } from "nativescript-context-apis";
import { EventData } from "./events";
import { builtInTasks } from "./internal/tasks";
import { enableLogging, setLoggerCreator } from "./internal/utils/logger";

export class Common extends Observable {
  public async init(
    appTasks: Array<Task>,
    appTaskGraph: TaskGraph,
    config: ConfigParams = {}
  ): Promise<void> {
    this.configure(config);
    await taskDispatcher.init(
      [...builtInTasks, ...appTasks],
      appTaskGraph,
      config
    );
    this.initializeListeners();
    await contextApis.init();
  }

  public isReady(): Promise<boolean> {
    return taskDispatcher.isReady();
  }

  public get tasksNotReady$(): Promise<Array<Task>> {
    return taskDispatcher.tasksNotReady;
  }

  public prepare(): Promise<void> {
    return taskDispatcher.prepare();
  }

  public emitEvent(eventName: string, eventData: EventData = {}): void {
    taskDispatcher.emitEvent(eventName, eventData);
  }

  private initializeListeners() {
    HumanActivityProvider.setup();
  }

  private configure(config: ConfigParams) {
    if (config.customLogger) {
      setLoggerCreator(config.customLogger);
    }
    if (config.enableLogging || config.customLogger) {
      enableLogging();
    }
  }
}

export { ConfigParams } from "nativescript-task-dispatcher/task-dispatcher.common";
