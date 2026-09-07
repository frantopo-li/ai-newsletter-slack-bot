import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
});

function textElementToMrkdwn(el: any): string {
  if (el.type === 'link') {
    return el.text ? `<${el.url}|${el.text}>` : `<${el.url}>`;
  }
  if (el.type === 'user') {
    return `<@${el.user_id}>`;
  }
  if (el.type === 'emoji') {
    return `:${el.name}:`;
  }
  if (el.type === 'text') {
    let text = el.text ?? '';
    const style = el.style ?? {};
    if (style.code) text = `\`${text}\``;
    if (style.bold) text = `*${text}*`;
    if (style.italic) text = `_${text}_`;
    if (style.strike) text = `~${text}~`;
    return text;
  }
  return '';
}

function sectionToMrkdwn(section: any): string {
  return (section.elements ?? []).map(textElementToMrkdwn).join('');
}

function richTextToMrkdwn(richTextValue: any): string {
  const elements = richTextValue?.elements ?? [];
  const lines: string[] = [];

  for (const block of elements) {
    if (block.type === 'rich_text_section') {
      lines.push(sectionToMrkdwn(block));
    } else if (block.type === 'rich_text_list') {
      const isOrdered = block.style === 'ordered';
      block.elements.forEach((item: any, index: number) => {
        const prefix = isOrdered ? `${index + 1}. ` : '- ';
        lines.push(prefix + sectionToMrkdwn(item));
      });
    } else if (block.type === 'rich_text_quote') {
      lines.push('> ' + sectionToMrkdwn(block));
    } else if (block.type === 'rich_text_preformatted') {
      lines.push('```' + sectionToMrkdwn(block) + '```');
    }
  }

  return lines.join('\n');
}

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
              type: 'rich_text_input',
              action_id: 'contenido_input',
            },
          },
          {
            type: 'input',
            block_id: 'archivo_block',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Archivos que quieras compartir (opcional)',
            },
            element: {
              type: 'file_input',
              action_id: 'archivo_input',
              max_files: 10,
            },
          },
        ],
      },
    });
  } catch (error) {
    logger.error('Error abriendo el modal:', error);
  }
});

// 2. Cuando la persona envía el formulario, tomamos los datos
//    y se los pasamos al webhook del Workflow Builder
app.view('ai_newsletter_submission', async ({ ack, body, view, logger }) => {
  await ack();

  const values = view.state.values as any;

  const contenidoRichText = values.contenido_block.contenido_input.rich_text_value;
  const contenido: string = richTextToMrkdwn(contenidoRichText);

  const archivos = values.archivo_block?.archivo_input?.files ?? [];
  const archivoUrl: string = archivos
    .map((archivo: any) => archivo.url_private)
    .join('\n');

  // body.user.name ya trae el handle del usuario, sin necesidad de
  // llamar a la API ni de scopes adicionales.
  const autorNombre: string = body.user.name || body.user.id;

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
        autor: autorNombre,
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