import type { View } from '@slack/bolt';
import {
  CONTENT_ACTION_ID,
  CONTENT_BLOCK_ID,
  FILES_ACTION_ID,
  FILES_BLOCK_ID,
  NEWSLETTER_VIEW_CALLBACK_ID,
} from './constants';

const MAX_FILES = 10;

export const newsletterModal: View = {
  type: 'modal',
  callback_id: NEWSLETTER_VIEW_CALLBACK_ID,
  title: { type: 'plain_text', text: 'AI Newsletter' },
  submit: { type: 'plain_text', text: 'Enviar' },
  close: { type: 'plain_text', text: 'Cancelar' },
  blocks: [
    {
      type: 'input',
      block_id: CONTENT_BLOCK_ID,
      label: {
        type: 'plain_text',
        text: 'Una herramienta, skill, tip o caso de uso que quieras compartir con el resto del equipo:',
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
        text: 'Archivos que quieras compartir (opcional)',
      },
      element: {
        type: 'file_input',
        action_id: FILES_ACTION_ID,
        max_files: MAX_FILES,
      },
    },
  ],
};
