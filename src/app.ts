import { App } from '@slack/bolt';
import { env } from './config/env';

export const app = new App({
  token: env.slackBotToken,
  signingSecret: env.slackSigningSecret,
  port: env.port,
});
