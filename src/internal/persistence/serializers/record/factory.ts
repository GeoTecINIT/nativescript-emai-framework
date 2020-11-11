import {Record, RecordType} from "../../../providers/base-record";
import {RecordSerializer} from "./record-serializer";
import {GeolocationSerializer} from "./types/geolocation";
import {HumanActivityChangeSerializer} from "./types/human-activity-change";

export class RecordSerializerFactory {
    public static createSerializer<T extends Record>(recordType: RecordType): RecordSerializer<Record | T> {
        switch (recordType) {
            case RecordType.Geolocation:
                return new GeolocationSerializer();
            case RecordType.HumanActivity:
                return new HumanActivityChangeSerializer();
            case RecordType.AoIProximityChange:
                return null;
        }
    }
}