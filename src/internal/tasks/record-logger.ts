import { Task, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";

import { Record } from "../providers/base-record";
import { recordsStoreDB } from "../persistence/stores/records";

export class RecordWriterTask extends Task {
  protected async onRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<void> {
    const record = invocationEvent.data as Record;
    await recordsStoreDB.insert(record);
    this.log(`A new record has been logged: ${JSON.stringify(record)}`);
  }
}
