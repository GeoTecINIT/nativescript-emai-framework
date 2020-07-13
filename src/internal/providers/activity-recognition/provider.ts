import { PushProvider } from "../push-provider";
import {
  ActivityRecognizer,
  getActivityRecognizer,
  Resolution,
} from "nativescript-context-apis/activity-recognition";

import { RecordType } from "../base-record";
import { getHumanActivityChangeReceiver } from "./receiver";

const possibleResolutions: Array<Resolution> = [
  Resolution.LOW,
  Resolution.MEDIUM,
];

export class HumanActivityProvider implements PushProvider {
  get provides() {
    return RecordType.HumanActivity;
  }

  static setup() {
    possibleResolutions.forEach((resolution) => {
      getActivityRecognizer(resolution).listenActivityChanges(
        (activityChange) => {
          getHumanActivityChangeReceiver().onReceive(activityChange);
        }
      );
    });
  }

  constructor(
    private resolution: Resolution,
    private detectionInterval: number,
    private providerLoader: (
      resolution: Resolution
    ) => ActivityRecognizer = getActivityRecognizer
  ) {}

  async checkIfIsReady(): Promise<void> {
    if (!this.activityRecognizer().isReady()) {
      throw new HumanActivityRecognizerNotReadyErr(this.resolution);
    }
  }

  async prepare(): Promise<void> {
    await this.activityRecognizer().prepare();
  }

  async startProviding(): Promise<void> {
    await this.activityRecognizer().startRecognizing({
      detectionInterval: this.detectionInterval,
    });
  }

  async stopProviding(): Promise<void> {
    await this.activityRecognizer().stopRecognizing();
  }

  private activityRecognizer(): ActivityRecognizer {
    return this.providerLoader(this.resolution);
  }
}

export class HumanActivityRecognizerNotReadyErr extends Error {
  constructor(resolution: Resolution) {
    super(
      `${resolution} resolution human activity recognizer. Perhaps the required permissions hadn't been granted. Be sure to call prepare() first`
    );
  }
}

export { Resolution } from "nativescript-context-apis/activity-recognition";
