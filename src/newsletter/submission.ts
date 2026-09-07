import { richTextToMrkdwn } from '../mrkdwn/rich-text';
import {
  CONTENT_ACTION_ID,
  CONTENT_BLOCK_ID,
  FILES_ACTION_ID,
  FILES_BLOCK_ID,
  TEAM_ACTION_ID,
  TEAM_BLOCK_ID,
} from './constants';
import { formatUsernameAsName } from './format-username';
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
    authorName: author.name ? formatUsernameAsName(author.name) : author.id,
    authorId: author.id,
    team: values[TEAM_BLOCK_ID]?.[TEAM_ACTION_ID]?.selected_option?.value ?? '',
  };
}