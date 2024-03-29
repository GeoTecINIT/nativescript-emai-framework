import { Task, TaskParams } from "nativescript-task-dispatcher/tasks";
import { DispatchableEvent } from "nativescript-task-dispatcher/events";
import { TracerConfig } from "./tracer-config";
import {
  TracesStore,
  syncedTracesStore,
} from "../../persistence/stores/timeseries";
import { Trace } from "./trace";
import { TraceType } from "./trace-type";
import { TraceResult } from "./trace-result";

export class EventTrackerTask extends Task {
  private readonly sensitiveData: boolean;

  constructor(
    name: string,
    taskConfig?: TracerConfig,
    private tracesStore: TracesStore = syncedTracesStore
  ) {
    super(name, taskConfig);
    this.sensitiveData = taskConfig && taskConfig.sensitiveData;
  }

  protected async onRun(
    taskParams: TaskParams,
    invocationEvent: DispatchableEvent
  ): Promise<void> {
    const { id, name, data } = invocationEvent;

    const trace: Trace = {
      timestamp: new Date(),
      chainId: id,
      type: TraceType.EVENT,
      name,
      result: TraceResult.OK,
      content: this.sensitiveData ? {} : data,
    };

    await this.tracesStore.insert(trace);
    this.log(`Event trace recorded: ${JSON.stringify(trace)}`);
  }
}
