(async function iniciarLoaderReenvio() {
  console.log("🚀 loader-reenvio.js ejecutándose...");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) throw new Error("ID de trámite no proporcionado");

    const hojaURL =
      "https://script.google.com/macros/s/AKfycbyxGFKK_epg_OMC_DlIHpiZdLrMh8CY0f_sbJ9M7oyW_ySwfx_a7XivMumymIYBLKsbIg/exec";

    const response = await fetch(`${hojaURL}?t=${Date.now()}`);
    const pedidos = await response.json();

    const pedido = pedidos.find((p) => p.IDTRAMITE === id);
    if (!pedido) {
      document.getElementById("contenedor-reenvio").innerHTML =
        `<div class="alert alert-danger">❌ No se encontró el pedido con ID ${id}</div>`;
      return;
    }

    console.log("📝 Pedido encontrado:", pedido);

    // 👇 rellenar los campos fijos del formulario
    const campoId = document.querySelector('#id-tramite');
    if (campoId) campoId.value = pedido.IDTRAMITE || '';

    const campoModulo = document.querySelector('input[name="modulo"]');
    if (campoModulo) campoModulo.value = (pedido.MODULO || '').trim();

    const campoSecretaria = document.querySelector('input[name="secretaria"]');
    if (campoSecretaria) campoSecretaria.value = (pedido.Secretaria || '').trim();

    const campoObservacion = document.querySelector('#observacion');
    if (campoObservacion) campoObservacion.value = pedido["MOTIVO OBSERVACION"] || '';

    // 👇 mostrar los demás campos editables dinámicamente
    mostrarCamposConDatos(pedido);

    console.log("✅ Datos cargados y listos para editar.");

  } catch (error) {
    console.error("❌ Error en loader-reenvio:", error);
    const contenedor = document.getElementById("contenedor-reenvio");
    if (contenedor) {
      contenedor.innerHTML =
        `<div class="alert alert-danger">Error al cargar el pedido: ${error.message}</div>`;
    }
  }
})();


function mostrarCamposConDatos(pedido) {
  const contenedor = document.getElementById("contenedor-reenvio");
  if (!contenedor) return;

  contenedor.innerHTML = ""; // limpiamos

  const camposExcluir = [
    "IDTRAMITE",
    "FECHA ACTUAL",
    "FECHA APROBACION",
    "MODULO",
    "Secretaria",
    "Nombre",
    "AUTORIZACION",
    "Carpeta Drive URL",
    "ESTADO APROBACION",
    "MOTIVO OBSERVACION",
    "Contrataciones / Compra",
    "GeneralPresupuesto1",
    "GeneralPresupuesto2"
  ];

  Object.entries(pedido).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined) return;

    if (typeof valor === "string" && valor.trim() === "") return;

    if (camposExcluir.includes(clave)) return;

    const div = document.createElement("div");
    div.classList.add("mb-3");

    const label = document.createElement("label");
    label.classList.add("form-label");
    label.textContent = clave;

    let input;
    if (typeof valor === "string" && valor.length > 50) {
      input = document.createElement("textarea");
      input.rows = 2;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.classList.add("form-control");
    input.name = clave;

    // 👉 si parece una fecha ISO válida, formateamos
    if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
      const fecha = new Date(valor);
      if (!isNaN(fecha)) {
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        valor = `${dia}/${mes}/${anio}`;
      }
    }

    input.value = valor;

    div.appendChild(label);
    div.appendChild(input);
    contenedor.appendChild(div);
  });
}
