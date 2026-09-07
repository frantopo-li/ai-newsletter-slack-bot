import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
});

// 1. When someone writes /ai-newsletter, we open the modal (form)
app.command('/ai-newsletter', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'ai_newsletter_submission',
        title: { type: 'plain_text', text: 'AI Newsletter' },
        submit: { type: 'plain_text', text: 'Enviar' },
        close: { type: 'plain_text', text: 'Cancelar' },
        blocks: [
          {
            type: 'input',
            block_id: 'contenido_block',
            label: {
              type: 'plain_text',
              text: 'Una herramienta, skill, tip o caso de uso que quieras compartir con el resto del equipo:',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'contenido_input',
              multiline: true,
            },
          },
          {
            type: 'input',
            block_id: 'archivo_block',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Un archivo que quieras compartir (opcional)',
            },
            element: {
              type: 'file_input',
              action_id: 'archivo_input',
              max_files: 1,
            },
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Error abriendo el modal:', error);
  }
});

// 2. When the person sends the form, we take the data and pass it to the webhook of the Workflow Builder
app.view('ai_newsletter_submission', async ({ ack, body, view, logger }) => {
  await ack();

  const values = view.state.values as any;

  const contenido: string = values.contenido_block.contenido_input.value ?? '';
  const archivos = values.archivo_block?.archivo_input?.files ?? [];
  const archivoUrl: string = archivos.length > 0 ? archivos[0].url_private : '';
  const autorId: string = body.user.id;

  const webhookUrl = process.env.WORKFLOW_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.error('Falta configurar WORKFLOW_WEBHOOK_URL en las variables de entorno');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido,
        archivo_url: archivoUrl,
        autor: `<@${autorId}>`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('El webhook del workflow respondió con error:', response.status, text);
    }
  } catch (error) {
    logger.error('Error llamando al webhook del workflow:', error);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ AI Newsletter bot corriendo');
})();
