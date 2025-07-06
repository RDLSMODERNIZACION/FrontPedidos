import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Permite usar un .env local durante el desarrollo

const app = express();
const PORT = process.env.PORT || 3000;

// URLs de las Web Apps de Google Apps Script
const {
  GAS_URL_CREAR_CARPETA,
  GAS_URL_ACTUALIZAR_ESTADO,
  GAS_URL_REENVIAR_PEDIDO,
  FRONTEND_ORIGIN
} = process.env;

if (!GAS_URL_CREAR_CARPETA || !GAS_URL_ACTUALIZAR_ESTADO || !GAS_URL_REENVIAR_PEDIDO) {
  console.warn('⚠️ Debes definir las URLs de GAS en las variables de entorno');
}

app.use(cors({ origin: FRONTEND_ORIGIN || '*' }));
app.use(express.json());

async function enviarPost(url, datos, res, mensajeError) {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const texto = await resp.text();
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

function validarBody(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ estado: 'error', mensaje: 'Datos enviados inválidos' });
    return false;
  }
  return true;
}

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
app.use((req, res) => {
  res.status(404).json({ estado: 'error', mensaje: 'Endpoint no encontrado' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});

