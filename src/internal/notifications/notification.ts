type TapAction = {
  type: TapActionType | string;
  id: string;
  metadata?: { [key: string]: any }
};

export interface Notification {
  id: number;
  title: string;
  tapAction: TapAction;
  timestamp: Date;
  body?: string;
  bigTextStyle?: boolean;
}

export interface NotificationIdentifiers {
  id: number;
  tapAction: TapAction;
}

export enum TapActionType {
  OPEN_APP = "open-app",
  OPEN_CONTENT = "open-content",
  DELIVER_QUESTIONS = "deliver-questions",
  ASK_FEEDBACK = "ask-feedback"
}
