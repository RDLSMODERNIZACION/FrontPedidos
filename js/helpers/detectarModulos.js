/**
 * Detecta los módulos presentes en el objeto `datos` y devuelve un array con los nombres.
 * También agrega la lista como `datos.modulosDetectados`.
 *
 * @param {object} datos - Objeto con los datos del formulario.
 * @returns {object} datos - El mismo objeto, con `modulosDetectados` agregado.
 */
export function detectarModulos(datos = {}) {
  const modulos = Object.keys(datos)
    .filter(k => k.startsWith("modulo_") && k !== "modulo")
    .map(k => k.replace("modulo_", "")); // Ejemplo: "modulo_obras" => "obras"

  console.log("🧩 Módulos detectados:", modulos);

  // agregamos la lista a datos
  return {
    ...datos,
    modulosDetectados: modulos
  };
}
