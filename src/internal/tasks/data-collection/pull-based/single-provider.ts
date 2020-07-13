import {
  Task,
  TaskConfig,
  TaskOutcome,
  TaskParams,
} from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";

import { PullProvider } from "../../../providers";
import { pascalCase } from "../../../utils/string";

export class SinglePullProviderTask extends Task {
  constructor(private provider: PullProvider, taskConfig?: TaskConfig) {
    super(`acquire${pascalCase(provider.provides)}`, {
      ...taskConfig,
      // Override declared output events with:
      // {recordType}Acquired
      // Where recordType is the provider output type
      outputEventNames: [`${provider.provides}Acquired`],
    });
  }

  async checkIfCanRun(): Promise<void> {
    await this.provider.checkIfIsReady();
  }

  async prepare(): Promise<void> {
    await this.provider.prepare();
  }

  protected async onRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<TaskOutcome> {
    const [recordPromise, stopCollecting] = this.provider.next();
    this.setCancelFunction(() => stopCollecting());
    const record = await recordPromise;

    return { result: record };
  }
}
