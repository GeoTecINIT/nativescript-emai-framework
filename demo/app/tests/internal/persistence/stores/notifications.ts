import {
    Notification,
    TapContentType,
} from "@geotecinit/emai-framework/internal/notifications";
import { notificationsStoreDB } from "@geotecinit/emai-framework/internal/persistence/stores/notifications";

describe("Notifications store", () => {
    const notificationId = 1;
    const expectedNotification: Notification = {
        title: "Notification title",
        tapContent: {
            type: TapContentType.QUESTIONS,
            id: "qs1",
        },
        body: "Notification body",
        timestamp: new Date(),
    };
    const store = notificationsStoreDB;

    it("allows to persist a notification without error", async () => {
        await store.insert(notificationId, expectedNotification);
    });

    it("allows to recover a notification by its given id", async () => {
        await store.insert(notificationId, expectedNotification);
        const notification = await store.get(notificationId);
        expect(notification).toEqual(expectedNotification);
    });

    it("allows to delete a persisted notification", async () => {
        await store.insert(notificationId, expectedNotification);
        await store.delete(notificationId);
        await expectAsync(store.get(notificationId)).toBeRejectedWithError(
            `Notification not found (id=${notificationId})`
        );
    });

    afterEach(async () => {
        await store.delete(notificationId);
    });
});
