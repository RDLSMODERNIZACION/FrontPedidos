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
    console.log("🧩 MODULO bruto:", pedido.MODULO);

    // Procesar y limpiar los módulos
    const modulosRaw = pedido.MODULO || "";
    const modulos = modulosRaw
      .split(",")
      .map(m => m.trim().replace(/^["']|["']$/g, '').toLowerCase())
      .filter(Boolean);

    console.log("🧩 Módulos detectados:", modulos);

    // Mostrar los módulos y secretaría en los campos principales (si existen)
    const campoModulo = document.querySelector('input[name="modulo"]');
    if (campoModulo) campoModulo.value = modulos.join(', ');

    const campoSecretaria = document.querySelector('input[name="secretaria"]');
    if (campoSecretaria && pedido.Secretaria) campoSecretaria.value = pedido.Secretaria.trim();

    // Cargar dinámicamente cada módulo
    for (const modulo of modulos) {
      try {
        const htmlResponse = await fetch(`/modulos/${modulo}/${modulo}.html`);
        if (!htmlResponse.ok) throw new Error(`No se pudo cargar HTML de "${modulo}"`);
        const html = await htmlResponse.text();
        document.getElementById("contenedor-reenvio").insertAdjacentHTML("beforeend", html);

        const script = document.createElement("script");
        script.src = `/modulos/${modulo}/${modulo}.js`;
        script.defer = true;
        document.body.appendChild(script);

        await new Promise(resolve => (script.onload = resolve));

        const funcion = `inicializarModulo${capitalizar(modulo)}`;
        if (typeof window[funcion] === "function") {
          window[funcion](pedido);
          console.log(`✅ ${funcion} ejecutada.`);
        } else {
          console.warn(`⚠️ No se encontró la función ${funcion}() para ${modulo}`);
        }

      } catch (modError) {
        console.error(`❌ Error al cargar módulo "${modulo}":`, modError);
      }
    }

  } catch (error) {
    console.error("❌ Error en loader-reenvio:", error);
    const contenedor = document.getElementById("contenedor-reenvio");
    if (contenedor) {
      contenedor.innerHTML = `<div class="alert alert-danger">Error al cargar el pedido: ${error.message}</div>`;
    }
  }
})();

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
