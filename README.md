# AI Newsletter Slack Bot

Bot interno de Slack que habilita el comando `/ai-newsletter`. Cualquiera en
el workspace puede escribirlo desde cualquier canal para compartir una
herramienta, tip, skill o caso de uso de IA que le haya resultado útil, sin
que ese hallazgo quede perdido entre conversaciones.

Al escribir el comando se abre al instante un formulario nativo de Slack con
un campo de texto enriquecido (bold, listas, links) y la posibilidad de
adjuntar uno o varios archivos. Al enviarlo, el bot postea automáticamente un
mensaje en el canal `#ai-newsletter` con el autor mencionado, el
contenido formateado y los archivos listados y en paralelo dispara un
Workflow de Slack que guarda una copia de esa información (autor, contenido,
archivos y fecha) en una spreadsheet de Google Sheets, para tener un registro
histórico y procesable.