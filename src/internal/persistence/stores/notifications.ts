import { Notification } from "../../notifications";
import { EMAIStore } from "./emai-store";

export interface NotificationsStore {
  insert(id: number, notification: Notification): Promise<void>;
  get(id: number): Promise<Notification>;
  delete(id: number): Promise<void>;
}

const DOC_TYPE = "notification";

class NotificationsStoreDB implements NotificationsStore {
  private readonly store: EMAIStore<Notification>;

  constructor() {
    this.store = new EMAIStore<Notification>(
      DOC_TYPE,
      docFrom,
      notificationFrom
    );
  }

  async insert(id: number, notification: Notification): Promise<void> {
    try {
      await this.get(id);
      return;
    } catch (err) {
      await this.store.create(notification, `${id}`);
    }
  }

  async get(id: number): Promise<Notification> {
    const notification = await this.store.get(`${id}`);
    if (!notification) {
      throw new Error(`Notification not found (id=${id})`);
    }
    return notification;
  }

  async delete(id: number): Promise<void> {
    await this.store.delete(`${id}`);
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