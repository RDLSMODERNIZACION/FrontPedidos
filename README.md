# Contrataciones Web v1

Este proyecto corresponde al frontend de la aplicación de solicitudes. Para la versión **v1** se consume directamente la Web App de Google Apps Script como backend. Las llamadas ya no pasan por el proxy Node.js.

## Despliegue en GitHub Pages

1. Realiza un fork o clona este repositorio en GitHub.
2. En la configuración del repositorio selecciona **Pages** y apunta a la rama principal (`main`) en la carpeta raíz.
3. Guarda los cambios y GitHub Pages publicará el sitio estático.

El sitio funcionará sin necesidad de levantar `server.js` ni instalar Node.js. Todas las peticiones `fetch` se envían directamente a Google Apps Script.

## Backend

Los endpoints consumidos son Web Apps de Google Apps Script:

- Crear carpeta: `https://script.google.com/macros/s/AKfycbw0Xp3sWFdG6Enbd3AW2fbEyu3PZxvXW-8czq2ZLG5uksFIdUKN7n9tJjFj-EQQp-qf/exec`
- Actualizar estado: `https://script.google.com/macros/s/AKfycbyny2IjeG_Xeg4BTEM979-cW5e7PMmApj-WhS9X29Q46GAh-tEC7mJoY66TV94gpgJe_w/exec`
- Reenviar pedido: `https://script.google.com/macros/s/AKfycbyCpB-_Xdop5qHhih13WArlQ9YfYYXSYT2BBeXGH3EY0IX8J7Q5qiVD6e-JkuUHqxI/exec`

Estos endpoints están definidos en `js/config/apiConfig.js` y son utilizados por el código JavaScript del proyecto.

