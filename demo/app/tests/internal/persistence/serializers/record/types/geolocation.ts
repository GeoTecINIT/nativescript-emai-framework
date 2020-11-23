import { Geolocation } from "@geotecinit/emai-framework/internal/providers/geolocation/geolocation";
import { GeolocationSerializer } from "@geotecinit/emai-framework/internal/persistence/serializers/record/types/geolocation";

describe("Geolocation serializer", () => {
    it("allows to serialize and deserialize an unchanged geolocation record", () => {
        const expectedGeolocation = new Geolocation(
            39.1,
            -0.01,
            121.3,
            10.0,
            10.0,
            0.003,
            280.1,
            new Date()
        );
        const serializer = new GeolocationSerializer();
        const serializedRecord = serializer.serialize(expectedGeolocation);
        const deserializedRecord = serializer.deserialize(serializedRecord);

        expect(deserializedRecord).toEqual(expectedGeolocation);
    });
});
