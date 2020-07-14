import { ProviderTask } from "../provider-task";

import { TaskConfig, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";

import { PushProvider } from "../../../providers";
import { pascalCase } from "../../../utils/string";

export class StartPushProviderTask extends ProviderTask<PushProvider> {
  constructor(
    provider: PushProvider,
    recordPrefix = "",
    taskConfig?: TaskConfig
  ) {
    super(
      `startDetecting${recordPrefix}${pascalCase(provider.provides)}Changes`,
      provider,
      {
        ...taskConfig,
        // Descendant classes should not declare custom output events
        outputEventNames: [],
      }
    );
  }

  protected async onRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<void> {
    await this.provider.startProviding();
    this.log("Change detection started");
  }
}
