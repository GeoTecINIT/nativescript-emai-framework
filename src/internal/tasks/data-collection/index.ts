import { Task } from "nativescript-task-dispatcher/tasks";
import { SinglePullProviderTask } from "./pull-based";
import { StartPushProviderTask, StopPushProviderTask } from "./push-based";

import { GeolocationProvider } from "../../providers/geolocation/provider";
import {
  HumanActivityProvider,
  Resolution,
} from "../../providers/activity-recognition/provider";

export const dataCollectionTasks: Array<Task> = [
  /* Geolocation */
  new SinglePullProviderTask(new GeolocationProvider(5, 5000), "Phone", {
    foreground: true,
  }),
  /* Human activity recognition */
  new StartPushProviderTask(
    new HumanActivityProvider(Resolution.LOW),
    "Coarse"
  ),
  new StopPushProviderTask(new HumanActivityProvider(Resolution.LOW), "Coarse"),
  new StartPushProviderTask(
    new HumanActivityProvider(Resolution.MEDIUM),
    "Intermediate"
  ),
  new StopPushProviderTask(
    new HumanActivityProvider(Resolution.MEDIUM),
    "Intermediate"
  ),
];
