import dotenv from 'dotenv';

dotenv.config();

export const env = {
  slackBotToken: process.env.SLACK_BOT_TOKEN,
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
  targetChannelId: process.env.TARGET_CHANNEL_ID,
  workflowWebhookUrl: process.env.WORKFLOW_WEBHOOK_URL,
};
