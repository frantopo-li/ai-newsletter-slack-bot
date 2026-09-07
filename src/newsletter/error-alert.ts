import type { Logger } from '@slack/bolt';
import { env } from '../config/env';
import type { SlackClient } from './types';

export type FailedStep = 'channel message' | 'spreadsheet save';

interface ErrorAlert {
  authorId: string;
  failedSteps: FailedStep[];
}

export async function notifyError(
  client: SlackClient,
  { authorId, failedSteps }: ErrorAlert,
  logger: Logger,
): Promise<void> {
  const channel = env.adminChannelId || env.targetChannelId;

  if (!channel) {
    return;
  }

  const detail = failedSteps.length > 0 ? ` (${failedSteps.join(', ')})` : '';

  try {
    await client.chat.postMessage({
      channel,
      text: `🚨 [Error] Processing the AI Newsletter form sent by <@${authorId}>${detail}. Please notify the admin.`,
    });
  } catch (error) {
    logger.error("[Error] We couldn't post the alert to the channel:", error);
  }
}
