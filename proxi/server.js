// Servidor Express que funciona como proxy a Google Apps Script
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Permite usar un .env local durante el desarrollo

// Inicializa Express
const app = express();
const PORT = process.env.PORT || 3000;

// URLs de las Web Apps de Google Apps Script
const {
  GAS_URL_CREAR_CARPETA,
  GAS_URL_ACTUALIZAR_ESTADO,
  GAS_URL_REENVIAR_PEDIDO,
  FRONTEND_ORIGIN
} = process.env;

// Verifica que las variables requeridas estén presentes
const faltantes = [
  'GAS_URL_CREAR_CARPETA',
  'GAS_URL_ACTUALIZAR_ESTADO',
  'GAS_URL_REENVIAR_PEDIDO'
].filter((v) => !process.env[v]);

if (faltantes.length) {
  console.error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  process.exit(1);
}

console.log('Variables de entorno cargadas:', {
  GAS_URL_CREAR_CARPETA,
  GAS_URL_ACTUALIZAR_ESTADO,
  GAS_URL_REENVIAR_PEDIDO,
  FRONTEND_ORIGIN
});

// Middleware de CORS y parseo de JSON
app.use(cors({ origin: FRONTEND_ORIGIN || '*' }));
app.use(express.json());

// Realiza la petición POST al GAS y envía la respuesta al cliente
async function enviarPost(url, datos, res, mensajeError) {
  try {
    console.log('➡️ Enviando POST a', url);
    console.log('Datos enviados:', datos);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const texto = await resp.text();
    console.log('Respuesta recibida:', texto);
    if (!resp.ok) {
      throw new Error(`Status ${resp.status}`);
    }
    try {
      const json = JSON.parse(texto);
      res.json(json);
    } catch (err) {
      console.error('❌ Respuesta no JSON:', err);
      res.status(500).json({ estado: 'error', mensaje: 'Respuesta inválida del GAS', detalle: texto });
    }
  } catch (error) {
    console.error(mensajeError, error);
    res.status(500).json({ estado: 'error', mensaje: 'Error al contactar al GAS' });
  }
}

// Valida que el cuerpo de la petición sea un objeto
function validarBody(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ estado: 'error', mensaje: 'Datos enviados inválidos' });
    return false;
  }
  return true;
}

// Rutas que reciben los datos desde el frontend
app.post('/api/crear-carpeta', (req, res) => {
  if (!validarBody(req, res)) return;
  enviarPost(GAS_URL_CREAR_CARPETA, req.body, res, '❌ Error en crear carpeta:');
});

app.post('/api/actualizar-estado', (req, res) => {
  if (!validarBody(req, res)) return;
  enviarPost(GAS_URL_ACTUALIZAR_ESTADO, req.body, res, '❌ Error en actualizar estado:');
});

app.post('/api/reenviar-pedido', (req, res) => {
  if (!validarBody(req, res)) return;
  enviarPost(GAS_URL_REENVIAR_PEDIDO, req.body, res, '❌ Error en reenviar pedido:');
});

// Manejo de rutas inexistentes
// Si ninguna ruta coincide, enviar error 404
app.use((req, res) => {
  res.status(404).json({ estado: 'error', mensaje: 'Endpoint no encontrado' });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});

