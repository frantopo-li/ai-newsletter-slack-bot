import type { App } from '@slack/bolt';
import { postToChannel } from './channel';
import { NEWSLETTER_COMMAND, NEWSLETTER_VIEW_CALLBACK_ID } from './constants';
import { notifyError, type FailedStep } from './error-alert';
import { newsletterModal } from './modal';
import { parseSubmission } from './submission';
import type { NewsletterViewState } from './types';
import { saveToSpreadsheet } from './workflow-webhook';

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
    const failedSteps: FailedStep[] = [];

    if (!(await postToChannel(client, submission, logger))) {
      failedSteps.push('channel message');
    }

    if (!(await saveToSpreadsheet(submission, logger))) {
      failedSteps.push('spreadsheet save');
    }

    if (failedSteps.length > 0) {
      await notifyError(client, { authorId: submission.authorId, failedSteps }, logger);
    }
  });
}
