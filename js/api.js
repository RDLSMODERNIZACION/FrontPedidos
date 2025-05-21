async function enviarFormulario(data) {
  try {
    const respuesta = await fetch("https://script.google.com/macros/s/TU_ID_DE_DEPLOY/exec", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const result = await respuesta.json();
    console.log("📤 Datos enviados:", result);
    Swal.fire("Éxito", "Formulario enviado correctamente", "success");
  } catch (error) {
    console.error("❌ Error al enviar:", error);
    Swal.fire("Error", "No se pudo enviar el formulario", "error");
  }
}