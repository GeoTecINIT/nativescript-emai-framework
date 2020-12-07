import { RecordSerializer } from "../record-serializer";
import { QuestionnaireAnswers } from "../../../../tasks/notifications/questionnaire-answers";
import { SerializedRecord } from "../serialized-record";

export class QuestionnaireAnswersSerializer
  implements RecordSerializer<QuestionnaireAnswers> {

  serialize(record: QuestionnaireAnswers): SerializedRecord {
    const {
      type,
      timestamp,
      change,
      answers
    } = record;

    const extraProperties = {
      answers
    };

    return {
      type,
      timestamp,
      change,
      extraProperties
    };
  }

  deserialize(serializedRecord: SerializedRecord): QuestionnaireAnswers {
    const { timestamp, extraProperties } = serializedRecord;
    const { answers } = extraProperties;

    return new QuestionnaireAnswers(answers, timestamp);
  }

}