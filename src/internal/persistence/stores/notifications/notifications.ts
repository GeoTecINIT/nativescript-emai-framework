import { Notification } from "../../../notifications";
import { notificationsModel } from "./model";
import { pluginDB } from "../db";

export interface NotificationsStore {
  insert(id: number, notification: Notification): Promise<void>;
  get(id: number): Promise<Notification>;
  delete(id: number): Promise<void>;
}

class NotificationsStoreDB implements NotificationsStore {
  private tableName = notificationsModel.name;

  async insert(id: number, notification: Notification): Promise<void> {
    const row = rowFrom(id, notification);

    try {
      await this.get(id);
      return;
    } catch (err) {
      const instance = await this.db();
      await instance.query("upsert", row).exec();
    }
  }

  async get(id: number): Promise<Notification> {
    const instance = await this.db();
    const rows = await instance.query("select").where(["id", "=", id]).exec();
    if (rows.length === 0) {
      throw new Error(`Notification not found (id=${id})`);
    }
    return notificationFrom(rows[0]);
  }

  async delete(id: number): Promise<void> {
    const instance = await this.db();
    await instance.query("delete").where(["id", "=", id]).exec();
  }

  private db(tableName = this.tableName) {
    return pluginDB.instance(tableName);
  }
}

function rowFrom(id: number, notification: Notification): any {
  const { title, tapContent, body, timestamp } = notification;
  return {
    id,
    title,
    tapContentType: tapContent.type,
    tapContentId: tapContent.id,
    body,
    timestamp: timestamp.getTime(),
  };
}

function notificationFrom(row: any): Notification {
  const { title, tapContentType, tapContentId, body, timestamp } = row;
  return {
    title,
    tapContent: {
      type: tapContentType,
      id: tapContentId,
    },
    body,
    timestamp: new Date(timestamp),
  };
}

export const notificationsStoreDB = new NotificationsStoreDB();
