import {
    QuestionnaireAnswers,
    ScaleAnswer
} from "@geotecinit/emai-framework/internal/tasks/notifications/questionnaire-answers";
import { QuestionnaireAnswersSerializer } from "@geotecinit/emai-framework/internal/persistence/serializers/record/types/questionnaire-answers";

describe("Questionnaire answers serializer", () => {
    it("allows to serialize and deserialize a questionnaire asnwers record", () => {
        const answers: Array<ScaleAnswer> = [
            {
                title: "Answer 1",
                millisecondsToAnswer: 1000,
                answer: 3
            },
            {
                title: "Answer 2",
                millisecondsToAnswer: 2000,
                answer: 7
            },
        ];

        const expectedQuestionnaireAnswers = new QuestionnaireAnswers(
            answers,
            new Date()
        );

        const serializer = new QuestionnaireAnswersSerializer();
        const serializedRecord = serializer.serialize(expectedQuestionnaireAnswers);
        const deserializedRecord = serializer.deserialize(serializedRecord);

        expect(deserializedRecord).toEqual(expectedQuestionnaireAnswers);
    })
})
