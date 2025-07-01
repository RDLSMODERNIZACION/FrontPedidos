import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Apps Script separados para cada POST
const URL_CREAR_CARPETA = 'https://script.google.com/macros/s/AKfycbyxGFKK_epg_OMC_DlIHpiZdLrMh8CY0f_sbJ9M7oyW_ySwfx_a7XivMumymIYBLKsbIg/exec';
const URL_GUARDAR_DATOS = 'https://script.google.com/macros/s/AKfycbyyvJqphqwcTdO0NxlPGPLsWqE0IQQLaKopiasoItQ62YfqMIEmJfZ0nie7Vpffdivq/exec';
const URL_ACTUALIZAR_ESTADO = 'https://script.google.com/macros/s/AKfycbzKgUcAELKDMjTklVEHjIdCw1OBSlhNdMz4hYRH0YlJc4rg_qRiuEWxUoJb65nSqvdnfQ/exec';

// 📁 PRIMER POST: crear carpeta
app.post('/api/crear-carpeta', async (req, res) => {
  try {
    const datos = req.body;

    const respuesta = await fetch(URL_CREAR_CARPETA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const json = await respuesta.json();
    res.json(json);
  } catch (error) {
    console.error('❌ Error en proxy (crear carpeta):', error);
    res.status(500).json({ estado: 'error', mensaje: 'Fallo al crear carpeta.' });
  }
});

// 📝 SEGUNDO POST: guardar datos
app.post('/api/guardar-datos', async (req, res) => {
  try {
    const datos = req.body;

    const respuesta = await fetch(URL_GUARDAR_DATOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const json = await respuesta.json();
    res.json(json);
  } catch (error) {
    console.error('❌ Error en proxy (guardar datos):', error);
    res.status(500).json({ estado: 'error', mensaje: 'Fallo al guardar los datos.' });
  }
});

// ✅ NUEVO POST: actualizar estado del pedido
app.post('/api/actualizar-estado', async (req, res) => {
  try {
    const datos = req.body;

    const respuesta = await fetch(URL_ACTUALIZAR_ESTADO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const json = await respuesta.json();
    res.json(json);
  } catch (error) {
    console.error('❌ Error en proxy (actualizar estado):', error);
    res.status(500).json({ estado: 'error', mensaje: 'Fallo al actualizar el estado del pedido.' });
  }
});

// 🟢 ¡Siempre al final!
app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});
