# Contrataciones Web

Este proyecto contiene el frontend en HTML/CSS/JS y un pequeño backend en Node.js que actúa como proxy hacia Google Apps Script. De esta manera se evitan los problemas de CORS al consumir la Web App de GAS desde GitHub Pages.

## Frontend

El sitio es estático y puede desplegarse en GitHub Pages.

1. Haz un fork o clona este repositorio.
2. En la configuración del repositorio habilita **GitHub Pages** apuntando a la rama `main` y carpeta raíz.
3. Publica los cambios y GitHub Pages servirá la web.

El código JavaScript realiza las peticiones a `https://contrataciones1.onrender.com` donde se encuentra el backend.

## Backend (proxy)

El backend se encuentra en la carpeta `proxi/` y utiliza Express. Debe desplegarse en un servicio como [Render](https://render.com/).

### Variables de entorno necesarias

En Render crea las siguientes variables en la sección **Environment**:

- `GAS_URL_CREAR_CARPETA`: URL de la Web App de GAS para crear carpetas.
- `GAS_URL_ACTUALIZAR_ESTADO`: URL para actualizar el estado.
- `GAS_URL_REENVIAR_PEDIDO`: URL para reenviar pedidos.
- `FRONTEND_ORIGIN`: (opcional) origen permitido para CORS, por ejemplo `https://tuusuario.github.io`.
- `PORT`: puerto de escucha (Render establece uno por defecto).

### Comandos

Render instalará las dependencias y ejecutará `npm start` de `proxi/package.json`.

Para probarlo localmente:

```bash
cd proxi
npm install
npm start
```

El proxy quedará disponible en `http://localhost:3000`.

## Uso desde el frontend

En `js/config/apiConfig.js` se define la URL base del backend. Los módulos del proyecto utilizan estas rutas para realizar las peticiones `fetch`.

```javascript
export const API_BASE_URL = 'https://contrataciones1.onrender.com';
export const API_URL_CREAR_CARPETA = `${API_BASE_URL}/api/crear-carpeta`;
```

De esta forma todo el código apunta al backend desplegado.

