console.log("✅ obras.js cargado correctamente");

function inicializarModuloObras() {
  console.log("🚀 Inicializando módulo Obras...");

  const switchMostrarObras = document.getElementById('switchObras');
  const opcionesObras = document.getElementById('opcionesObras');
  const ayudaObrasBtn = document.getElementById('ayudaObrasBtn');
  const ayudaTextoObras = document.getElementById('ayudaTextoObras');

  const radiosTipo = document.querySelectorAll('input[name="tipo"]');
  const seccionObraExistente = document.getElementById('seccionObraExistente');
  const seccionObraNueva = document.getElementById('seccionObraNueva');
  const seccionObraOtra = document.getElementById('seccionObraOtra');

  opcionesObras.classList.add('d-none');
  seccionObraExistente.classList.add('d-none');
  seccionObraNueva.classList.add('d-none');
  seccionObraOtra.classList.add('d-none');

  switchMostrarObras?.addEventListener('change', () => {
    if (switchMostrarObras.checked) {
      opcionesObras.classList.remove('d-none');
    } else {
      opcionesObras.classList.add('d-none');
      seccionObraExistente.classList.add('d-none');
      seccionObraNueva.classList.add('d-none');
      seccionObraOtra.classList.add('d-none');
      radiosTipo.forEach(r => r.checked = false);
    }
  });

  ayudaObrasBtn?.addEventListener('click', () => {
    ayudaTextoObras?.classList.toggle('d-none');
  });

  radiosTipo.forEach(radio => {
    radio.addEventListener('change', async () => {
      const tipo = radio.value;
      seccionObraExistente.classList.add('d-none');
      seccionObraNueva.classList.add('d-none');
      seccionObraOtra.classList.add('d-none');

      if (tipo === 'existente') {
        seccionObraExistente.classList.remove('d-none');
        await cargarListaObrasExistentes();
      } else if (tipo === 'nueva') {
        seccionObraNueva.classList.remove('d-none');
      } else if (tipo === 'otra') {
        seccionObraOtra.classList.remove('d-none');
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
      const option = document.createElement('option');
      option.value = valor;
      option.textContent = valor;
      obraSelect.appendChild(option);
    });

    console.log('✅ Lista de obras cargada.');
  } catch (error) {
    console.error('❌ Error cargando obras:', error);
  }
}

// 🌟 CORRECCIÓN: usamos data-modulo="obras" (plural) para coincidir con tu HTML
window.obtenerDatosObras = function () {
  const modulo = document.querySelector('[data-modulo="obras"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo de obras");
    return {};
  }

  const tipoSeleccionado = modulo.querySelector('input[name="tipo"]:checked')?.value || '';
  const datos = { tipo: tipoSeleccionado, obra: '', anexo: null };

  if (tipoSeleccionado === 'existente') {
    datos.obra = modulo.querySelector('#obra')?.value.trim() || '';
  } else if (tipoSeleccionado === 'nueva') {
    const archivoInput = modulo.querySelector('#anexo2Archivo');
    const archivo = archivoInput?.files?.[0];
    datos.obra = archivo?.name || '';
    datos.anexo = archivo ? { nombre: archivo.name, base64: null } : null;
  } else if (tipoSeleccionado === 'otra') {
    datos.obra = modulo.querySelector('#detalleOtraObra')?.value.trim() || '';
  }

  console.log("📦 Datos capturados desde obras.js:", datos);
  return datos;
};

window.inicializarModuloObras = inicializarModuloObras;
