import { archivoAObjetoBase64 } from '../helpers/base64.js';

console.log("✅ obras.js cargado correctamente");

export async function obtenerDatosObras() {
  // 🔍 Busca data-modulo="obras" (plural)
  const modulo = document.querySelector('[data-modulo="obras"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo de obras");
    return {};
  }

  console.log("🧪 obtenerDatosObras: módulo encontrado");

  const tipoSeleccionado = modulo.querySelector('input[name="tipo"]:checked')?.value || '';
  const datos = { tipo: tipoSeleccionado, obra: '', anexo: null };

  if (tipoSeleccionado === 'existente') {
    datos.obra = modulo.querySelector('#obra')?.value.trim() || '';

  } else if (tipoSeleccionado === 'nueva') {
    const inputFile = modulo.querySelector('#anexo2Archivo');
    const archivo = inputFile?.files?.[0];
    if (archivo) {
      console.log("🧪 obtenerDatosObras: archivo seleccionado", archivo.name);
      const base64obj = await archivoAObjetoBase64(archivo);
      datos.obra = archivo.name;
      datos.anexo = base64obj;
    }

  } else if (tipoSeleccionado === 'otra') {
    datos.obra = modulo.querySelector('#detalleOtraObra')?.value.trim() || '';
  }

  console.log("📦 Datos capturados módulo obras:", datos);
  return datos;
}

export function inicializarModuloObras() {
  console.log("🚀 Inicializando módulo Obras...");

  const switchMostrarObras = document.getElementById('switchObras');
  const opcionesObras       = document.getElementById('opcionesObras');
  const ayudaObrasBtn       = document.getElementById('ayudaObrasBtn');
  const ayudaTextoObras     = document.getElementById('ayudaTextoObras');

  const radiosTipo          = document.querySelectorAll('input[name="tipo"]');
  const seccionExistente    = document.getElementById('seccionObraExistente');
  const seccionNueva        = document.getElementById('seccionObraNueva');
  const seccionOtra         = document.getElementById('seccionObraOtra');

  function ocultarSecciones() {
    seccionExistente.classList.add('d-none');
    seccionNueva.classList.add('d-none');
    seccionOtra.classList.add('d-none');
  }

  ocultarSecciones();
  opcionesObras.classList.add('d-none');

  switchMostrarObras.addEventListener('change', () => {
    if (switchMostrarObras.checked) {
      opcionesObras.classList.remove('d-none');
    } else {
      opcionesObras.classList.add('d-none');
      ocultarSecciones();
      radiosTipo.forEach(r => r.checked = false);
    }
  });

  ayudaObrasBtn.addEventListener('click', () => {
    ayudaTextoObras.classList.toggle('d-none');
  });

  radiosTipo.forEach(radio => {
    radio.addEventListener('change', async () => {
      ocultarSecciones();
      if (radio.value === 'existente') {
        seccionExistente.classList.remove('d-none');
        await cargarListaObrasExistentes();
      } else if (radio.value === 'nueva') {
        seccionNueva.classList.remove('d-none');
      } else if (radio.value === 'otra') {
        seccionOtra.classList.remove('d-none');
      }
    });
  });
}

async function cargarListaObrasExistentes() {
  try {
    const obraSelect = document.getElementById('obra');
    if (!obraSelect) return;

    const obras = await fetch('../componentes/listas/obras_existentes.json').then(r => r.json());
    obraSelect.innerHTML = '<option value="">Seleccione una obra...</option>';

    obras.forEach(item => {
      const valor = typeof item === 'string' ? item : item.nombre;
      const opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      obraSelect.appendChild(opt);
    });

    console.log('✅ Lista de obras cargada.');
  } catch (e) {
    console.error('❌ Error cargando obras:', e);
  }
}
