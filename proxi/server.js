import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Apps Script URLs
const URL_CREAR_CARPETA = 'https://script.google.com/macros/s/AKfycbw0Xp3sWFdG6Enbd3AW2fbEyu3PZxvXW-8czq2ZLG5uksFIdUKN7n9tJjFj-EQQp-qf/exec';
const URL_ACTUALIZAR_ESTADO = 'https://script.google.com/macros/s/AKfycbyny2IjeG_Xeg4BTEM979-cW5e7PMmApj-WhS9X29Q46GAh-tEC7mJoY66TV94gpgJe_w/exec';
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
