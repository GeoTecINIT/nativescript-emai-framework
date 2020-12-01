import { Record, RecordType } from "../../providers/base-record";

export class QuestionnaireAnswers extends Record {
  constructor(
    public answers: Array<QuestionnaireAnswer>,
    answeredAt = new Date()
  ) {
    super(RecordType.QuestinnaireAnswers, answeredAt);
  }
}

interface QuestionnaireAnswer {
  title: string;
  millisecondsToAnswer: number;
  // answer: number;
}

export interface ScaleAnswer extends QuestionnaireAnswer {
  answer: number;
}
