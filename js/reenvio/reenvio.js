import { reenviarPedido } from './reenviarService.js';

document.addEventListener("DOMContentLoaded", () => {
  const botonReenviar = document.getElementById("btn-reenviar-definitivo");
  if (!botonReenviar) {
    console.warn("❌ No se encontró el botón #btn-reenviar-definitivo.");
    return;
  }

  

  botonReenviar.addEventListener("click", () => {
    const datos = {
      idTramite: document.getElementById("id-tramite")?.value || "",
      modulo: document.getElementById("modulo")?.value || "",
      secretaria: document.getElementById("secretaria")?.value || "",
      observacion: document.getElementById("observacion")?.value || "",
      detalle: document.getElementById("detalle")?.value || "",
    };

    console.log("📤 Reenviando con datos:", datos);

    reenviarPedido(datos);
  });
});
