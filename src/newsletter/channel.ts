import type { Logger } from '@slack/bolt';
import { env } from '../config/env';
import { buildNewsletterMessage } from './message';
import type { NewsletterSubmission, SlackClient } from './types';

export async function postToChannel(
  client: SlackClient,
  submission: NewsletterSubmission,
  logger: Logger,
): Promise<boolean> {
  const channel = env.targetChannelId;

  if (!channel) {
    logger.error('Missing TARGET_CHANNEL_ID environment variable');
    return false;
  }

  try {
    await client.chat.postMessage({
      channel,
      ...buildNewsletterMessage(submission),
      unfurl_links: false,
      unfurl_media: false,
    });

    return true;
  } catch (error) {
    logger.error('Error posting the message to the channel:', error);
    return false;
  }
}
