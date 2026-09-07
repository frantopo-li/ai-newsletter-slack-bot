import type { App } from '@slack/bolt';
import { env } from '../config/env';
import { NEWSLETTER_COMMAND, NEWSLETTER_VIEW_CALLBACK_ID } from './constants';
import { buildNewsletterMessage } from './message';
import { newsletterModal } from './modal';
import { parseSubmission } from './submission';
import type { NewsletterViewState } from './types';
import { saveToSpreadsheet } from './workflowWebhook';

export function registerNewsletterHandlers(app: App): void {
  app.command(NEWSLETTER_COMMAND, async ({ ack, body, client, logger }) => {
    await ack();

    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: newsletterModal,
      });
    } catch (error) {
      logger.error('Error opening the modal:', error);
    }
  });

  app.view(NEWSLETTER_VIEW_CALLBACK_ID, async ({ ack, body, view, client, logger }) => {
    await ack();

    const submission = parseSubmission(view.state as NewsletterViewState, body.user);
    const targetChannel = env.targetChannelId;

    if (targetChannel) {
      try {
        await client.chat.postMessage({
          channel: targetChannel,
          ...buildNewsletterMessage(submission),
          unfurl_links: false,
          unfurl_media: false,
        });
      } catch (error) {
        logger.error('Error posting the message to the channel:', error);
      }
    } else {
      logger.error('Missing TARGET_CHANNEL_ID environment variable');
    }

    await saveToSpreadsheet(submission, logger);
  });
}
