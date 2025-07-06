console.log("✅ general.js cargado correctamente");

window.inicializarModuloGeneral = async function () {
  console.log("🚀 Inicializando módulo General…");

  await esperarElemento("#fecha");
  await esperarElemento("#periodo");

  await asegurarFlatpickr();

  const inputFecha = document.getElementById("fecha");
  const inputPeriodo = document.getElementById("periodo");
  const contenedorPresupuestos = document.getElementById("subida-presupuestos");
  const presupuesto1 = document.getElementById("presupuesto1");
  const presupuesto2 = document.getElementById("presupuesto2");

  if (inputFecha) {
    flatpickr(inputFecha, {
      dateFormat: "d/m/Y",
      locale: "es",
      defaultDate: "today",
      onChange: function (selectedDates) {
        const hoy = new Date();
        const seleccionada = selectedDates[0];
        const esHoy = seleccionada.toDateString() === hoy.toDateString();

        contenedorPresupuestos.classList.toggle("d-none", esHoy);
        presupuesto1.required = !esHoy;
        presupuesto2.required = !esHoy;
      }
    });
  }

  if (inputPeriodo) {
    flatpickr(inputPeriodo, {
      mode: "range",
      dateFormat: "d/m/Y",
      locale: "es"
    });
  }

  // Ajustar estado inicial del contenedor presupuestos
  const hoy = new Date();
  const seleccionada = flatpickr.parseDate(inputFecha.value, "d/m/Y");
  if (seleccionada) {
    const esHoy = seleccionada.toDateString() === hoy.toDateString();
    contenedorPresupuestos.classList.toggle("d-none", esHoy);
    presupuesto1.required = !esHoy;
    presupuesto2.required = !esHoy;
  }

  console.log("✅ Flatpickr inicializado correctamente en #fecha y #periodo");
};

async function asegurarFlatpickr() {
  if (typeof flatpickr !== 'undefined') {
    console.log("✅ flatpickr ya está cargado");
    return;
  }

  console.log("⏳ Cargando flatpickr…");

  // CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
  document.head.appendChild(link);

  // JS
  await new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/flatpickr";
    script.onload = () => {
      console.log("✅ flatpickr cargado desde CDN");
      resolve();
    };
    document.head.appendChild(script);
  });
}

function esperarElemento(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) return resolve();
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector(selector)) {
        resolve();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// 👇 Para recolectar los datos
window.obtenerDatosGeneral = function () {
  const datos = {};
  const modulo = document.querySelector('[data-modulo="general"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo [general]");
    return datos;
  }

  const campos = modulo.querySelectorAll('input[name], select[name], textarea[name]');
  campos.forEach(campo => {
    if (!campo.name) return;
    if (campo.type === "checkbox") {
      datos[campo.name] = campo.checked;
    } else if (campo.type === "radio") {
      if (campo.checked) datos[campo.name] = campo.value;
    } else {
      datos[campo.name] = campo.value.trim();
    }
  });

  console.log("📦 Datos capturados de [general]:", datos);
  return datos;
};
