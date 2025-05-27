import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Apps Script separados para cada POST
const URL_CREAR_CARPETA = 'https://script.google.com/macros/s/AKfycbzHqiBJGOeDTmZ2M5Oy4xLG95Fwb4Uf4YH1kAn263jj8km0Y2ICYurNWxzJ39cp_c9xZg/exec';
const URL_GUARDAR_DATOS = 'https://script.google.com/macros/s/AKfycbyEXkZHAucy8zAWLsP02s_V0tf0JPu-RwNWD46PXCDd7oCk9FQPnr0MaYIshVf-vKAD/exec'; // ← Cambiar por el segundo

// 📁 PRIMER POST: crear carpeta, subir archivos
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

// 📝 SEGUNDO POST: guardar solo datos (sin archivos)
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

app.listen(PORT, () => {
  console.log(`🚀 Proxy activo en http://localhost:${PORT}`);
});
