import type { AllMiddlewareArgs, KnownBlock } from '@slack/bolt';
import type { RichTextValue } from '../mrkdwn/types';

export type SlackClient = AllMiddlewareArgs['client'];

export interface SlackUploadedFile {
  name: string;
  url_private: string;
  permalink?: string;
}

export interface NewsletterSubmission {
  content: string;
  files: SlackUploadedFile[];
  authorName: string;
  authorId: string;
  team: string;
}

export interface NewsletterViewState {
  values: {
    [blockId: string]: {
      [actionId: string]: {
        rich_text_value?: RichTextValue;
        files?: SlackUploadedFile[];
        selected_option?: {
          value: string;
          text: { type: string; text: string };
        };
      };
    };
  };
}

export interface NewsletterMessageContent {
  text: string;
  blocks: KnownBlock[];
}