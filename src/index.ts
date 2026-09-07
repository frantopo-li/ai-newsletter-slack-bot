import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(process.env.PORT) || 3000,
});

// Convierte un elemento de texto individual (con estilos) a mrkdwn de Slack
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

// Convierte una "sección" (grupo de elementos de texto) a una línea de mrkdwn
function sectionToMrkdwn(section: any): string {
  return (section.elements ?? []).map(textElementToMrkdwn).join('');
}

// Convierte el valor completo de un rich_text_input a un string en mrkdwn de Slack
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

// 1. Cuando alguien escribe /ai-newsletter, abrimos el modal (formulario)
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

// 2. Cuando la persona envía el formulario:
//    a) el bot postea el mensaje directo al canal (así el formato
//       -negrita, listas, links- se renderiza correctamente)
//    b) le pega al webhook del Workflow Builder solo para guardar
//       la fila en Google Sheets
app.view('ai_newsletter_submission', async ({ ack, body, view, client, logger }) => {
  await ack();

  const values = view.state.values as any;

  const contenidoRichText = values.contenido_block.contenido_input.rich_text_value;
  const contenido: string = richTextToMrkdwn(contenidoRichText);

  const archivos = values.archivo_block?.archivo_input?.files ?? [];
  const archivoUrl: string = archivos
    .map((archivo: any) => archivo.url_private)
    .join('\n');

  // Lista de archivos en mrkdwn, usando el permalink para que sea clickeable
  const archivosMrkdwn: string = archivos
    .map((archivo: any) => `• <${archivo.permalink || archivo.url_private}|${archivo.name}>`)
    .join('\n');

  // body.user.name (el handle) sigue sirviendo para la fila de la spreadsheet,
  // sin necesidad de scopes extra.
  const autorNombre: string = body.user.name || body.user.id;

  // Para el mensaje en el canal, usamos la mención real <@ID> — como el bot
  // postea el mensaje directamente (no vía variable de webhook), Slack SÍ
  // la renderiza como @mención clickeable con el nombre de la persona.
  const autorMencion: string = `<@${body.user.id}>`;

  const targetChannel = process.env.TARGET_CHANNEL_ID;

  // a) Postear el mensaje directo al canal, con formato real
  if (targetChannel) {
    try {
      const blocks: any[] = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📰 *Nuevo aporte para la AI Newsletter:*\n\n💡 *Autor:* ${autorMencion}\n\n${contenido}`,
          },
        },
      ];

      if (archivos.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📎 *Archivos:*\n${archivosMrkdwn}`,
          },
        });
      }

      await client.chat.postMessage({
        channel: targetChannel,
        text: `Nuevo aporte para la AI Newsletter de ${autorNombre}`, // fallback para notificaciones
        blocks,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (error) {
      logger.error('Error posteando el mensaje al canal:', error);
    }
  } else {
    logger.error('Falta configurar TARGET_CHANNEL_ID en las variables de entorno');
  }

  // b) Avisarle al webhook del workflow para que guarde la fila en Sheets
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