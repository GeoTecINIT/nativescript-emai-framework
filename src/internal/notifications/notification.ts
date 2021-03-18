export interface Notification {
  id: number;
  title: string;
  tapContent: {
    type: TapContentType;
    id: string;
  };
  timestamp: Date;
  body?: string;
  bigTextStyle?: boolean;
}

export enum TapContentType {
  NONE = "none",
  RICH_TEXT = "rich-text",
  QUESTIONS = "questions",
}
