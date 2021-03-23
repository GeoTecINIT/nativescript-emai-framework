import { Record, RecordType } from "../../providers";

export class QuestionnaireAnswers extends Record {
  constructor(
    public notificationId: number,
    public questionnaireId: string,
    public answers: Array<QuestionnaireAnswer>,
    answeredAt = new Date()
  ) {
    super(RecordType.QuestionnaireAnswers, answeredAt);
  }
}

export interface QuestionnaireAnswer {
  title: string;
  millisecondsToAnswer: number;
  answer: number | string | boolean;
}
