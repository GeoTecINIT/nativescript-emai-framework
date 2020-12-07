import { Record, RecordType } from "../../../providers/base-record";
import { RecordSerializer } from "./record-serializer";
import { GeolocationSerializer } from "./types/geolocation";
import { HumanActivityChangeSerializer } from "./types/human-activity-change";
import { AoiProximityChangeSerializer } from "./types/aoi-proximity-change";
import { QuestionnaireAnswersSerializer } from "./types/questionnaire-answers";

export class RecordSerializerFactory {
  public static createSerializer<T extends Record>(
    recordType: RecordType | string
  ): RecordSerializer<Record | T> {
    switch (recordType) {
      case RecordType.Geolocation:
        return new GeolocationSerializer();
      case RecordType.HumanActivity:
        return new HumanActivityChangeSerializer();
      case RecordType.AoIProximityChange:
        return new AoiProximityChangeSerializer();
      case RecordType.QuestionnaireAnswers:
        return new QuestionnaireAnswersSerializer();
      default:
        throw new Error(
          `No serializer has been implemented for (${recordType}) record type`
        );
    }
  }
}
