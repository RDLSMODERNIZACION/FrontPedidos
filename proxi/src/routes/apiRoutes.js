import { Router } from 'express';
import fetch from 'node-fetch';
import { body, validationResult } from 'express-validator';
import {
  GAS_URL_CREAR_CARPETA,
  GAS_URL_ACTUALIZAR_ESTADO,
  GAS_URL_REENVIAR_PEDIDO,
} from '../config.js';
import cache from '../utils/cache.js';
import { logger } from '../utils/logger.js';

const router = Router();

async function enviarPost(url, datos) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const text = await resp.text();
  logger.info('Respuesta recibida:', text);
  if (!resp.ok) throw new Error(`Status ${resp.status}`);
  return JSON.parse(text);
}

const validarBody = [body().isObject().withMessage('Datos enviados inválidos')];

router.post('/crear-carpeta', validarBody, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: 'error', mensaje: errors.array()[0].msg });
  }
  const cacheKey = `crear-${JSON.stringify(req.body)}`;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  try {
    logger.info('➡️ Enviando POST a', GAS_URL_CREAR_CARPETA);
    const json = await enviarPost(GAS_URL_CREAR_CARPETA, req.body);
    cache.set(cacheKey, json);
    res.json(json);
  } catch (err) {
    logger.error('❌ Error en crear carpeta:', err);
    res.status(500).json({ estado: 'error', mensaje: 'Error al contactar al GAS' });
  }
});

router.post('/actualizar-estado', validarBody, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: 'error', mensaje: errors.array()[0].msg });
  }
  try {
    logger.info('➡️ Enviando POST a', GAS_URL_ACTUALIZAR_ESTADO);
    const json = await enviarPost(GAS_URL_ACTUALIZAR_ESTADO, req.body);
    res.json(json);
  } catch (err) {
    logger.error('❌ Error en actualizar estado:', err);
    res.status(500).json({ estado: 'error', mensaje: 'Error al contactar al GAS' });
  }
});

router.post('/reenviar-pedido', validarBody, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ estado: 'error', mensaje: errors.array()[0].msg });
  }
  try {
    logger.info('➡️ Enviando POST a', GAS_URL_REENVIAR_PEDIDO);
    const json = await enviarPost(GAS_URL_REENVIAR_PEDIDO, req.body);
    res.json(json);
  } catch (err) {
    logger.error('❌ Error en reenviar pedido:', err);
    res.status(500).json({ estado: 'error', mensaje: 'Error al contactar al GAS' });
  }
});

export default router;
