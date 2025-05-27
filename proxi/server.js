import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5dJU3HHBAl4O1v-XGhdHMG8-ock3ddOHPJjr7A1wNSlKTbjRTcT5KzjYWme1O18GD2Q/exec'; // ← PONÉ TU URL AQUÍ

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
