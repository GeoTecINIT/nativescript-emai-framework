import { ProviderTask } from "../provider-task";

import {
  TaskConfig,
  TaskOutcome,
  TaskParams,
} from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";

import { PullProvider } from "../../../providers";
import { pascalCase } from "../../../utils/string";

export class SinglePullProviderTask extends ProviderTask<PullProvider> {
  constructor(provider: PullProvider, taskConfig?: TaskConfig) {
    super(`acquire${pascalCase(provider.provides)}`, provider, {
      ...taskConfig,
      // Override declared output events with:
      // {recordType}Acquired
      // Where recordType is the provider output type
      outputEventNames: [`${provider.provides}Acquired`],
    });
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
