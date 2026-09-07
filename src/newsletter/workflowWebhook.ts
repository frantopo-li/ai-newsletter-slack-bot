import type { Logger } from '@slack/bolt';
import { env } from '../config/env';
import type { NewsletterSubmission } from './types';

export async function saveToSpreadsheet(
  { content, files, authorName, team }: NewsletterSubmission,
  logger: Logger,
): Promise<void> {
  const webhookUrl = env.workflowWebhookUrl;

  if (!webhookUrl) {
    logger.error('Falta configurar WORKFLOW_WEBHOOK_URL en las variables de entorno');
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
        'El webhook del workflow respondió con error:',
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    logger.error('Error llamando al webhook del workflow:', error);
  }
}