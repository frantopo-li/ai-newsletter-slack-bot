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
        text: `📰 *Nuevo aporte para la AI Newsletter:*\n\n💡 *Autor:* <@${authorId}>\n🏷️ *Team:* ${team}\n\n${content}`,
      },
    },
  ];

  if (files.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📎 *Archivos:*\n${filesToMrkdwn(files)}`,
      },
    });
  }

  return {
    text: `Nuevo aporte para la AI Newsletter de ${authorName} (${team})`,
    blocks,
  };
}