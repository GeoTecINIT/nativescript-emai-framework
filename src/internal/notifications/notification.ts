export interface Notification {
  id: number;
  title: string;
  tapAction: {
    type: TapActionType | string;
    id: string;
    metadata?: { [key: string]: any };
  };
  timestamp: Date;
  body?: string;
  bigTextStyle?: boolean;
}

export enum TapActionType {
  NONE = "none",
  RICH_TEXT = "rich-text",
  QUESTIONS = "questions",
}
