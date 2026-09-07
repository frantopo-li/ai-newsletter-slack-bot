import type { Logger } from '@slack/bolt';
import { env } from '../config/env';
import type { NewsletterSubmission } from './types';

export async function saveToSpreadsheet(
  { content, files, authorName, team }: NewsletterSubmission,
  logger: Logger,
): Promise<void> {
  const webhookUrl = env.workflowWebhookUrl;

  if (!webhookUrl) {
    logger.error('Missing WORKFLOW_WEBHOOK_URL environment variable');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido: content,
        archivo_url: files.map((file) => file.url_private).join('\n'),
        autor: authorName,
        equipo: team,
      }),
    });

    if (!response.ok) {
      logger.error(
        'The workflow webhook responded with an error:',
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    logger.error('Error calling the workflow webhook:', error);
  }
}