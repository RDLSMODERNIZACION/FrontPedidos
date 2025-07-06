# Proxy Backend

Este directorio contiene el servidor Express que actúa como intermediario entre el frontend estático y las Web Apps de Google Apps Script.

## Puesta en marcha

1. Copia `.env.example` a `.env` y completa las URLs de tus Web Apps.
2. Instala las dependencias y ejecuta el servidor:

```bash
cd proxi
npm install
npm start
```

El proxy quedará disponible en `http://localhost:3000` o el puerto definido en `.env`.

En Render debes crear un nuevo *Web Service*, conectar este repositorio y definir las mismas variables de entorno en la sección **Environment**.

## Mejoras sugeridas para Google Apps Script

- Procesa los datos recibidos validando tipos y campos antes de usarlos.
- Envía respuestas JSON simples indicando estado y mensajes de error claros.
- Utiliza ejecución rápida de funciones y evita llamadas innecesarias a servicios externos para reducir la latencia.
