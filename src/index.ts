import { app } from './app';
import { registerNewsletterHandlers } from './newsletter';

registerNewsletterHandlers(app);

async function start(): Promise<void> {
  await app.start();
  console.log('⚡️ AI Newsletter bot corriendo');
}

start();
