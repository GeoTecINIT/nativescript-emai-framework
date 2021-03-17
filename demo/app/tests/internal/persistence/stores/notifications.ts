import {
    Notification,
    TapContentType,
} from "@geotecinit/emai-framework/internal/notifications";
import { notificationsStoreDB } from "@geotecinit/emai-framework/internal/persistence/stores/notifications";
import { first, last, take } from "rxjs/internal/operators";

describe("Notifications store", () => {
    const notification1Id = 1;
    const expectedNotification1: Notification = {
        notificationId: notification1Id,
        title: "Notification title",
        tapContent: {
            type: TapContentType.QUESTIONS,
            id: "qs1",
        },
        body: "Notification body",
        timestamp: new Date(Date.now() - 60000),
    };

    const notification2Id = 2;
    const expectedNotification2: Notification = {
        notificationId: notification2Id,
        title: "Notification title",
        tapContent: {
            type: TapContentType.RICH_TEXT,
            id: "rtc1",
        },
        body: "Notification body",
        timestamp: new Date(),
    };
    const store = notificationsStoreDB;

    it("allows to persist a notification without error", async () => {
        await store.insert(notification1Id, expectedNotification1);
    });

    it("allows to recover a notification by its given id", async () => {
        await store.insert(notification1Id, expectedNotification1);
        const notification = await store.get(notification1Id);

        expect(notification).toEqual(expectedNotification1);
    });

    it("allows to delete a persisted notification", async () => {
        await store.insert(notification1Id, expectedNotification1);
        await store.delete(notification1Id);
        await expectAsync(store.get(notification1Id)).toBeRejectedWithError(
            `Notification not found (id=${notification1Id})`
        );
    });

    it("allows to query all stored notifications" , async () => {
       await store.insert(notification1Id, expectedNotification1);
       await store.insert(notification2Id, expectedNotification2);

       const storedNotifications = await store.list().pipe(first()).toPromise();

       expect(storedNotifications.length).toBe(2);
       expect(storedNotifications[0]).toEqual(expectedNotification2);
       expect(storedNotifications[1]).toEqual(expectedNotification1);
    });

    it("allows to listen to stored notification changes", async () => {
       await store.insert(notification1Id, expectedNotification1);

       const updates = store.list().pipe(take(2), last()).toPromise();
       store.insert(notification2Id, expectedNotification2);
       const storedNotifications = await updates;

       expect(storedNotifications.length).toBe(2);
       expect(storedNotifications[0]).toEqual(expectedNotification2);
    });

    it("allows to get all the persisted notifications sorted by most recent", async () => {
        await store.insert(notification1Id, expectedNotification1);
        await store.insert(notification2Id, expectedNotification2);

        await expectAsync(store.getAll()).toBeResolvedTo([expectedNotification2, expectedNotification1])
    });

    afterEach(async () => {
        await store.delete(notification1Id);
        await store.delete(notification2Id);
    });
});
