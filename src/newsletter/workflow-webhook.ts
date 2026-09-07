import type { Logger } from '@slack/bolt';
import { env } from '../config/env';
import type { NewsletterSubmission } from './types';

export async function saveToSpreadsheet(
  { content, files, authorName, team }: NewsletterSubmission,
  logger: Logger,
): Promise<boolean> {
  const webhookUrl = env.workflowWebhookUrl;

  if (!webhookUrl) {
    logger.error('Missing WORKFLOW_WEBHOOK_URL environment variable');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        file_url: files.map((file) => file.url_private).join('\n'),
        author: authorName,
        team,
      }),
    });

    if (!response.ok) {
      logger.error(
        'The workflow webhook responded with an error:',
        response.status,
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error calling the workflow webhook:', error);
    return false;
  }
}