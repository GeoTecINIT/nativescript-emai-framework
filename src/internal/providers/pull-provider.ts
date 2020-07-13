import { Record, RecordType } from "./base-record";
import { ProviderInterruption } from "./provider-interrupter";

export interface PullProvider {
  provides: RecordType;
  checkIfIsReady(): Promise<void>;
  prepare(): Promise<void>;
  next(): [Promise<Record>, ProviderInterruption];
}
