import { pluginDB } from "../internal/persistence/stores/db";

export async function clearEMAIDB(): Promise<void> {
  await pluginDB.deleteAll();
}
