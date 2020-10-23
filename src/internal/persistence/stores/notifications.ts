import { Notification } from "../../notifications";
import { Couchbase } from "nativescript-couchbase-plugin";

export interface NotificationsStore {
  insert(id: number, notification: Notification): Promise<void>;
  get(id: number): Promise<Notification>;
  delete(id: number): Promise<void>;
}

const DB_NAME = "emai-notifications";

class NotificationsStoreDB implements NotificationsStore {
  private readonly database: Couchbase;

  constructor() {
    this.database = new Couchbase(DB_NAME);
  }

  async insert(id: number, notification: Notification): Promise<void> {
    const doc = docFrom(notification);

    try {
      await this.get(id);
      return;
    } catch (err) {
      this.database.createDocument(doc, `${id}`);
    }
  }

  async get(id: number): Promise<Notification> {
    const doc = this.database.getDocument(`${id}`);
    if (!doc) {
      throw new Error(`Notification not found (id=${id})`);
    }
    return notificationFrom(doc);
  }

  async delete(id: number): Promise<void> {
    this.database.deleteDocument(`${id}`);
  }
}

function docFrom(notification: Notification): any {
  const { title, tapContent, body, timestamp } = notification;
  return {
    title,
    tapContentType: tapContent.type,
    tapContentId: tapContent.id,
    body,
    timestamp: timestamp.getTime(),
  };
}

function notificationFrom(doc: any): Notification {
  const { title, tapContentType, tapContentId, body, timestamp } = doc;
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
