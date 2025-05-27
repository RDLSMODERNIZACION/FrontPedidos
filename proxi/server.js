import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHqiBJGOeDTmZ2M5Oy4xLG95Fwb4Uf4YH1kAn263jj8km0Y2ICYurNWxzJ39cp_c9xZg/exec'; // ← PONÉ TU URL AQUÍ

app.post('/api/enviar-formulario', async (req, res) => {
  try {
    const datos = req.body;

    const respuesta = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const json = await respuesta.json();
    res.json(json);
  } catch (error) {
    console.error('❌ Error en proxy:', error);
    res.status(500).json({ estado: 'error', mensaje: 'Fallo al reenviar al Apps Script.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});
