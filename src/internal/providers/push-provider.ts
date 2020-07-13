import { RecordType } from "./base-record";

export interface PushProvider {
  provides: RecordType;
  checkIfIsReady(): Promise<void>;
  prepare(): Promise<void>;
  startProviding(): Promise<void>;
  stopProviding(): Promise<void>;
}
