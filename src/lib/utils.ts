// src/lib/utils.ts

/** Formatea dinero de manera segura (acepta number | string | null | undefined). */
export const fmtMoney = (n: unknown): string => {
  if (n === null || n === undefined || n === "") return "—";
  const num = typeof n === "string" ? Number(n) : (n as number);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
};

/** Fecha/hora local segura. Si el valor es inválido devuelve "—". */
export const fmtDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};

/** Capitaliza y reemplaza guiones bajos. Tolera null/undefined. */
export const cap = (s?: string | null): string =>
  (s ?? "")
    .replace(/_/g, " ")
    .replace(/^\p{L}/u, (c) => c.toUpperCase());
