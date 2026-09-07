# AI Newsletter Slack Bot

Bot de Slack que, al escribir `/ai-newsletter`, abre un formulario (modal) para
compartir un tip, herramienta o caso de uso de IA, y envía las respuestas al
webhook de un Workflow de Slack (Workflow Builder), que se encarga de postear
el mensaje al canal y guardar la fila en Google Sheets.

## 1. Variables de entorno

Copiá `.env.example` a `.env` y completá los 4 valores:

```bash
cp .env.example .env
```

## 2. Correr en local (para probar)

```bash
npm install
npm run dev
```

Esto levanta el servidor en `http://localhost:3000`, pero Slack necesita una
URL pública para mandarte los eventos. Para probar en local, usá
[ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Copiá la URL que te da ngrok (algo como `https://abc123.ngrok.io`) y pegala
como `request_url` en:
- **Slash Commands** → editá `/ai-newsletter` → Request URL:
  `https://abc123.ngrok.io/slack/events`
- **Interactivity & Shortcuts** → Request URL: la misma URL
