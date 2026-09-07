import type { KnownBlock } from '@slack/bolt';
import type { RichTextValue } from '../mrkdwn/types';

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
}

export interface NewsletterViewState {
  values: {
    [blockId: string]: {
      [actionId: string]: {
        rich_text_value?: RichTextValue;
        files?: SlackUploadedFile[];
      };
    };
  };
}

export interface NewsletterMessageContent {
  text: string;
  blocks: KnownBlock[];
}
