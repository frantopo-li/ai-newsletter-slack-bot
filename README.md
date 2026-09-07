# AI Newsletter Slack Bot

Bot de Slack que, al escribir `/ai-newsletter`, abre un formulario (modal) para
compartir un tip, herramienta o caso de uso de IA, y envía las respuestas al
webhook de un Workflow de Slack (Workflow Builder), que se encarga de postear
el mensaje al canal y guardar la fila en Google Sheets.

## 1. Crear la app de Slack

1. Andá a https://api.slack.com/apps → **Create New App** → **From an app manifest**
2. Elegí tu workspace (Light-it)
3. Pegá el contenido de `manifest.yml` (vas a tener que editar la línea
   `request_url` después de hacer el deploy, ver paso 4)
4. Creá la app

## 2. Instalar la app y obtener tokens

1. En el menú lateral, andá a **OAuth & Permissions**
2. Hacé clic en **Install to Workspace**
3. Copiá el **Bot User OAuth Token** (empieza con `xoxb-`) → esto va en
   `SLACK_BOT_TOKEN`
4. Andá a **Basic Information** → **App Credentials** → copiá el
   **Signing Secret** → esto va en `SLACK_SIGNING_SECRET`

## 3. Configurar el workflow para recibir datos por webhook

1. En tu Workflow Builder, editá el trigger inicial y cambialo a
   **"From a webhook"**
2. Definí 3 variables: `contenido`, `archivo_url`, `autor` (texto)
3. Guardá y copiá la URL del webhook que te da Slack
4. Pegala en `WORKFLOW_WEBHOOK_URL` en tu `.env`
5. En el paso "Send a message to..." de tu workflow, reemplazá las variables
   viejas (las que venían del formulario) por estas nuevas del webhook

## 4. Variables de entorno

Copiá `.env.example` a `.env` y completá los 4 valores:

```bash
cp .env.example .env
```

## 5. Correr en local (para probar)

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

## 6. Deploy a producción (Render)

1. Subí este código a tu repo de GitHub (ya lo tenés creado)
2. Andá a https://render.com → **New** → **Web Service**
3. Conectá tu repo `ai-newsletter-slack-bot`
4. Configurá:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
5. En **Environment Variables**, cargá los mismos 4 valores de tu `.env`
6. Deploy. Cuando termine, Render te da una URL pública fija
   (ej: `https://ai-newsletter-slack-bot.onrender.com`)
7. Volvé a Slack (Slash Commands e Interactivity) y actualizá el Request URL
   con esa URL de Render + `/slack/events`

## 7. Probar

Escribí `/ai-newsletter` en cualquier canal donde esté invitado el bot.
Debería abrirse el formulario al instante.
