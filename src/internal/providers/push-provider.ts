export interface PushProvider {
  checkIfIsReady(): Promise<void>;
  prepare(): Promise<void>;
  startProviding(): Promise<void>;
  stopProviding(): Promise<void>;
}
