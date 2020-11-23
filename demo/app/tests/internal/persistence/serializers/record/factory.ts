import { RecordSerializerFactory } from "@geotecinit/emai-framework/internal/persistence/serializers/record/factory";
import { RecordType } from "@geotecinit/emai-framework/internal/providers/base-record";

import { GeolocationSerializer } from "@geotecinit/emai-framework/internal/persistence/serializers/record/types/geolocation";
import { HumanActivityChangeSerializer } from "@geotecinit/emai-framework/internal/persistence/serializers/record/types/human-activity-change";

describe("Record serializer factory", () => {
    it("allows to create a geolocation serializer", () => {
        const serializer = RecordSerializerFactory.createSerializer(
            RecordType.Geolocation
        );
        expect(serializer).toBeInstanceOf(GeolocationSerializer);
    });

    it("allows to create a human activity change serializer", () => {
        const serializer = RecordSerializerFactory.createSerializer(
            RecordType.HumanActivity
        );
        expect(serializer).toBeInstanceOf(HumanActivityChangeSerializer);
    });
});
