import type { View } from '@slack/bolt';
import {
  CONTENT_ACTION_ID,
  CONTENT_BLOCK_ID,
  FILES_ACTION_ID,
  FILES_BLOCK_ID,
  NEWSLETTER_VIEW_CALLBACK_ID,
  TEAM_ACTION_ID,
  TEAM_BLOCK_ID,
  TEAM_OPTIONS,
} from './constants';

const MAX_FILES = 10;

export const newsletterModal: View = {
  type: 'modal',
  callback_id: NEWSLETTER_VIEW_CALLBACK_ID,
  title: { type: 'plain_text', text: 'AI Newsletter' },
  submit: { type: 'plain_text', text: 'Send' },
  close: { type: 'plain_text', text: 'Cancel' },
  blocks: [
    {
      type: 'input',
      block_id: CONTENT_BLOCK_ID,
      label: {
        type: 'plain_text',
        text: 'A tool, skill, tip or use case you want to share with the rest of the team:',
      },
      element: {
        type: 'rich_text_input',
        action_id: CONTENT_ACTION_ID,
      },
    },
    {
      type: 'input',
      block_id: FILES_BLOCK_ID,
      optional: true,
      label: {
        type: 'plain_text',
        text: 'Files you want to share (optional)',
      },
      element: {
        type: 'file_input',
        action_id: FILES_ACTION_ID,
        max_files: MAX_FILES,
      },
    },
    {
      type: 'input',
      block_id: TEAM_BLOCK_ID,
      label: {
        type: 'plain_text',
        text: 'Team where it may be useful',
      },
      element: {
        type: 'static_select',
        action_id: TEAM_ACTION_ID,
        placeholder: { type: 'plain_text', text: 'Select a team' },
        options: TEAM_OPTIONS.map((team) => ({
          text: { type: 'plain_text', text: team },
          value: team,
        })),
      },
    },
  ],
};