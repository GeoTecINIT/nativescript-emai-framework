import { Observable } from "tns-core-modules/data/observable";
import { TapActionType } from "@geotecinit/emai-framework/notifications";
import { emaiFramework } from "@geotecinit/emai-framework";
import {
    QuestionnaireAnswers,
    QuestionnaireAnswer,
} from "@geotecinit/emai-framework/entities/answers";
import { TappedNotification } from "~/notification-handler/notification-handler-service";
import { notificationsManager } from "@geotecinit/emai-framework/notifications";

export class NotificationViewModel extends Observable {
    private readonly _content: NotificationContent;
    private readonly _answers: Map<string, QuestionAnswer>;
    private readonly _questions: Array<Question>;

    constructor(private notification: TappedNotification) {
        super();
        if (notification.tapAction.type === TapActionType.RICH_TEXT) {
            this._content = createExampleRichText();
        } else {
            this._content = createExampleQuestionSet();
            this._answers = new Map<string, QuestionAnswer>();
            this._questions = (<QuestionSet>this._content).questions;
        }

        notificationsManager.markAsSeen(notification.id);
    }

    get content(): NotificationContent {
        return this._content;
    }

    get questions(): Array<Question> {
        return this._questions;
    }

    get answers(): Map<string, QuestionAnswer> {
        return this._answers;
    }

    submitAnswers() {
        if (this.content.type !== TapActionType.QUESTIONS) {
            throw new Error(
                "Cannot submit answers for a not 'questions' content type"
            );
        }

        const questionAnswers = [...this.answers.values()];
        const sortedAnswers = questionAnswers.sort(
            (a, b) => a.answerTime - b.answerTime
        );
        const qas: Array<QuestionnaireAnswer> = sortedAnswers.map(
            (questionAnswer, i) => ({
                title: questionAnswer.title,
                millisecondsToAnswer:
                    questionAnswer.answerTime -
                    (i === 0
                        ? this.notification.tappingTimestamp
                        : sortedAnswers[i - 1].answerTime),
                answer: questionAnswer.answer,
            })
        );
        emaiFramework.emitEvent(
            "questionnaireAnswersAcquired",
            new QuestionnaireAnswers(
                this.notification.id,
                this.notification.tapAction.id,
                qas,
            )
        );
    }
}

export type NotificationContent = RichText | QuestionSet;

export interface RichText {
    type: TapActionType.RICH_TEXT;
    title: string;
    body: string;
}

export interface QuestionSet {
    type: TapActionType.QUESTIONS;
    title: string;
    description: string;
    questions: Array<Question>;
}

export type Question = ScaleQuestion;

export interface ScaleQuestion {
    type: "scale";
    title: string;
    start: number;
    end: number;
}

export type Answer = number;

export interface QuestionAnswer {
    title: string;
    answer: Answer;
    answerTime: number;
}

function createExampleRichText(): RichText {
    return {
        type: TapActionType.RICH_TEXT,
        title: "Negative thoughts",
        body:
            "Most of us spend a lot of time inside our own mind — worrying about the future, replaying events " +
            "in the past, and generally focusing on the parts of life that leave us dissatisfied. While common, " +
            "negative or unwanted thoughts can prevent you from enjoying experiences, distract you from focusing " +
            "on what's important, and drain your energy. They can also make you feel anxious and depressed.",
    };
}

function createExampleQuestionSet(): QuestionSet {
    return {
        type: TapActionType.QUESTIONS,
        title: "Concentration",
        description:
            "A self-assessment of your inner you can help you to identify where are your thoughts going.",
        questions: [
            {
                type: "scale",
                title: "From 1 to 10, how clear are your thoughts?",
                start: 1,
                end: 10,
            },
            {
                type: "scale",
                title: "From 1 to 10, how anxious do you feel?",
                start: 1,
                end: 10,
            },
        ],
    };
}
