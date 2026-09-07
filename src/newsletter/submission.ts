import { richTextToMrkdwn } from '../mrkdwn/richText';
import {
  CONTENT_ACTION_ID,
  CONTENT_BLOCK_ID,
  FILES_ACTION_ID,
  FILES_BLOCK_ID,
  TEAM_ACTION_ID,
  TEAM_BLOCK_ID,
} from './constants';
import type { NewsletterSubmission, NewsletterViewState } from './types';

interface SubmissionAuthor {
  id: string;
  name?: string;
}

export function parseSubmission(
  state: NewsletterViewState,
  author: SubmissionAuthor,
): NewsletterSubmission {
  const { values } = state;

  return {
    content: richTextToMrkdwn(values[CONTENT_BLOCK_ID]?.[CONTENT_ACTION_ID]?.rich_text_value),
    files: values[FILES_BLOCK_ID]?.[FILES_ACTION_ID]?.files ?? [],
    authorName: author.name || author.id,
    authorId: author.id,
    team: values[TEAM_BLOCK_ID]?.[TEAM_ACTION_ID]?.selected_option?.value ?? '',
  };
}