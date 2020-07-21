import { HumanActivityChange } from "nativescript-emai-framework/internal/providers/activity-recognition/human-activity-change";
import { HumanActivity } from "nativescript-emai-framework/internal/providers/activity-recognition/human-activity-change";
import { Change } from "nativescript-emai-framework/internal/providers/base-record";
import { HumanActivityChangeSerializer } from "nativescript-emai-framework/internal/persistence/serializers/record/types/human-activity-change";

describe("Human activity change serializer", () => {
    it("allows to serialize and deserialize an unchanged human activity change record", () => {
        const expectedChange = new HumanActivityChange(
            HumanActivity.WALKING,
            Change.START,
            new Date()
        );
        const serializer = new HumanActivityChangeSerializer();
        const serializedRecord = serializer.serialize(expectedChange);
        const deserializedRecord = serializer.deserialize(serializedRecord);

        expect(deserializedRecord).toEqual(expectedChange);
    });
});
