// helpers/areaDestino.js

/**
 * Determina el área de destino según el monto del presupuesto.
 * @param {string|number} presupuesto - Monto del presupuesto (puede venir con puntos o comas).
 * @returns {string} - "Contrataciones" si ≥ 5 millones, si no "Compras".
 */
export function obtenerAreaDestino(presupuesto) {
  if (!presupuesto) return "Compras";

  const monto = Number(
    presupuesto
      .toString()
      .replaceAll('.', '') // quita separadores de miles
      .replace(',', '.')   // convierte coma decimal a punto
  );

  if (isNaN(monto)) return "Compras";

  return monto >= 10000000 ? "Contrataciones" : "Compras";
}
