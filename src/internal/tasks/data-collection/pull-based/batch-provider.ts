import { SinglePullProviderTask } from "./single-provider";
import { PullProvider, Record } from "../../../providers";
import { TracerConfig } from "../../tracing";
import { TaskOutcome, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";

export class BatchPullProviderTask extends SinglePullProviderTask {
  constructor(
    provider: PullProvider,
    recordPrefix = "",
    taskConfig?: TracerConfig
  ) {
    super(provider, `Multiple${recordPrefix}`, taskConfig);
  }

  protected async onTracedRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<TaskOutcome> {
    const records: Array<Record> = [];
    let executionTimes = [];
    while (
      executionTimes.length === 0 ||
      average(executionTimes) < this.remainingTime()
    ) {
      const start = Date.now();
      const taskOutcome = await super.onTracedRun(taskParams, invocationEvent);
      records.push(taskOutcome.result);
      executionTimes.push(Date.now() - start);
    }
    return { result: records };
  }
}

function average(executionTimes: Array<number>) {
  return (
    executionTimes.reduce((prev, curr) => prev + curr, 0) /
    executionTimes.length
  );
}
