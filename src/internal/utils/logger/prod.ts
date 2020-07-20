import { AbstractLogger } from "./common";

export class ProdLogger extends AbstractLogger {
  constructor(tag: string) {
    super(tag);
  }

  protected logDebug(message: any) {}

  protected logInfo(message: any) {
    console.log(message);
  }

  protected logWarning(message: any) {
    console.warn(message);
  }

  protected logError(message: any) {
    console.error(message);
  }
}
