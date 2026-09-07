import type { KnownBlock } from '@slack/bolt';
import type { NewsletterMessageContent, NewsletterSubmission, SlackUploadedFile } from './types';

function filesToMrkdwn(files: SlackUploadedFile[]): string {
  return files
    .map((file) => `• <${file.permalink || file.url_private}|${file.name}>`)
    .join('\n');
}

export function buildNewsletterMessage({
  content,
  files,
  authorName,
  authorId,
  team,
}: NewsletterSubmission): NewsletterMessageContent {
  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📰 *New contribution to the AI Newsletter:*\n\n💡 *Author:* <@${authorId}>\n🏷️ *Useful For:* ${team}\n\n${content}`,
      },
    },
  ];

  if (files.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📎 *Files:*\n${filesToMrkdwn(files)}`,
      },
    });
  }

  return {
    text: `New contribution to the AI Newsletter from ${authorName} (${team})`,
    blocks,
  };
}