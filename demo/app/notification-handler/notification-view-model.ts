import { Observable } from "tns-core-modules/data/observable";
import {
    Notification,
    TapContentType,
} from "nativescript-emai-framework/notifications";
import { emaiFramework } from "nativescript-emai-framework";

export class NotificationViewModel extends Observable {
    private readonly _content: NotificationContent;
    private readonly _answers: Array<Answer>;

    constructor(private notification: Notification) {
        super();
        if (notification.tapContent.type === TapContentType.RICH_TEXT) {
            this._content = createExampleRichText();
        } else {
            this._content = createExampleQuestionSet();
            this._answers = [];
        }
    }

    get content(): NotificationContent {
        return this._content;
    }

    get answers(): Array<Answer> {
        return this._answers;
    }

    submitAnswers() {
        if (this.content.type !== TapContentType.QUESTIONS) {
            throw new Error(
                "Cannot submit answers for a not 'questions' content type"
            );
        }

        const qas: Array<QuestionAnswer> = this.content.questions.map(
            (question, i) => ({
                title: question.title,
                answer: this.answers[i],
            })
        );
        emaiFramework.emitEvent("questionsAnswered", { answers: qas });
    }
}

export type NotificationContent = RichText | QuestionSet;

export interface RichText {
    type: TapContentType.RICH_TEXT;
    title: string;
    body: string;
}

export interface QuestionSet {
    type: TapContentType.QUESTIONS;
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
}

function createExampleRichText(): RichText {
    return {
        type: TapContentType.RICH_TEXT,
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
        type: TapContentType.QUESTIONS,
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
        ],
    };
}
