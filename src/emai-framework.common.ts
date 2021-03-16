import { Observable } from "tns-core-modules/data/observable";

import { ConfigParams as TDConfigParams } from "nativescript-task-dispatcher/task-dispatcher.common";
import { Task } from "./tasks";
import { TaskGraph } from "./tasks/graph";
import { HumanActivityProvider } from "./internal/providers/activity-recognition/provider";
import { taskDispatcher } from "nativescript-task-dispatcher";
import { contextApis } from "nativescript-context-apis";
import { EventData } from "./events";
import { builtInTasks } from "./internal/tasks";
import { enableLogging, setLoggerCreator } from "./internal/utils/logger";
import { notificationsManager } from "./internal/notifications/manager";
import { RecordsStore } from "./storage/records";
import { TracesStore} from "./storage/traces";
import {
  syncedRecordsStore,
  syncedTracesStore,
} from "./internal/persistence/stores/timeseries";

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
    await this.syncStores();
    await this.clearOldData();
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

  private async syncStores() {
    await syncedRecordsStore.sync();
  }

  private async clearOldData() {
    await syncedRecordsStore.clearOld();
  }

  private configure(config: ConfigParams) {
    if (config.customLogger) {
      setLoggerCreator(config.customLogger);
    }
    if (config.enableLogging || config.customLogger) {
      enableLogging();
    }
    if (config.notificationsChannelName) {
      notificationsManager.setChannelName(config.notificationsChannelName);
    }
    if (config.externalRecordsStore) {
      syncedRecordsStore.setExternalStore(config.externalRecordsStore);
    }
    if (config.externalTracesStore) {
      syncedTracesStore.setExternalStore(config.externalTracesStore);
    }
    if (config.oldRecordsMaxAgeHours) {
      syncedRecordsStore.setClearOldThreshold(config.oldRecordsMaxAgeHours);
    }
    if (config.oldTracesMaxAgeHours) {
      syncedTracesStore.setClearOldThreshold(config.oldTracesMaxAgeHours);
    }
  }
}

export interface ConfigParams extends TDConfigParams {
  notificationsChannelName?: string;
  externalRecordsStore?: RecordsStore;
  oldRecordsMaxAgeHours?: number;
  externalTracesStore?: TracesStore;
  oldTracesMaxAgeHours?: number;
}
