import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Apps Script URLs
const URL_CREAR_CARPETA = 'https://script.google.com/macros/s/AKfycbyxGFKK_epg_OMC_DlIHpiZdLrMh8CY0f_sbJ9M7oyW_ySwfx_a7XivMumymIYBLKsbIg/exec';
const URL_GUARDAR_DATOS = 'https://script.google.com/macros/s/AKfycbyyvJqphqwcTdO0NxlPGPLsWqE0IQQLaKopiasoItQ62YfqMIEmJfZ0nie7Vpffdivq/exec';
const URL_ACTUALIZAR_ESTADO = 'https://script.google.com/macros/s/AKfycbzKgUcAELKDMjTklVEHjIdCw1OBSlhNdMz4hYRH0YlJc4rg_qRiuEWxUoJb65nSqvdnfQ/exec';
const URL_REENVIAR_PEDIDO = 'https://script.google.com/macros/s/AKfycbyCpB-_Xdop5qHhih13WArlQ9YfYYXSYT2BBeXGH3EY0IX8J7Q5qiVD6e-JkuUHqxI/exec';

// 📁 PRIMER POST
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

// 📝 SEGUNDO POST
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

// ✅ ACTUALIZAR ESTADO
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

// 🔷 NUEVO: REENVIAR PEDIDO
app.post('/api/reenviar-pedido', async (req, res) => {
  try {
    const datos = req.body;
    const respuesta = await fetch(URL_REENVIAR_PEDIDO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const texto = await respuesta.text();
    console.log("📩 Respuesta cruda desde Apps Script:", texto);

    let json;
    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.error("❌ No se pudo parsear JSON:", e);
      res.status(500).json({ estado: 'error', mensaje: 'Respuesta inválida del Apps Script.', detalle: texto });
      return;
    }

    res.json(json);
  } catch (error) {
    console.error('❌ Error en proxy (reenviar pedido):', error);
    res.status(500).json({ estado: 'error', mensaje: 'Fallo al reenviar el pedido.' });
  }
});



// 🟢 ¡Siempre al final!
app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});
