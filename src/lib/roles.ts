// src/lib/roles.ts
import type { BackendPedido } from "@/lib/api";

// Estructura de usuario que ya venís usando en AuthContext/lib/auth
export type AuthUser = {
  username: string;
  secretaria?: string | null;
  secretaria_id?: number | null;
};

// Normalizador de montos (acepta number o string tipo "12.345.678,90")
function toAmount(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  // quita separadores de miles y usa punto como decimal
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

// Detectores de rol a partir del nombre de secretaría del usuario
export function isEconomiaAdmin(user?: AuthUser | null) {
  const s = (user?.secretaria || "").toUpperCase();
  return s.includes("ECONOM"); // "SECRETARÍA DE ECONOMÍA"
}
export function isAreaCompras(user?: AuthUser | null) {
  const s = (user?.secretaria || "").toUpperCase();
  return s.includes("ÁREA DE COMPRAS") || s.includes("AREA DE COMPRAS");
}
export function isSecretariaCompras(user?: AuthUser | null) {
  const s = (user?.secretaria || "").toUpperCase();
  return s.includes("SECRETARÍA DE COMPRAS") || s.includes("SECRETARIA DE COMPRAS");
}

const UMBRAL = 10_000_000;

// ¿Puede VER el pedido en la lista?
export function canView(user: AuthUser | null | undefined, row: BackendPedido): boolean {
  if (isEconomiaAdmin(user)) return true;
  const monto = toAmount(row.total);
  if (isAreaCompras(user)) return monto > UMBRAL;
  if (isSecretariaCompras(user)) return monto <= UMBRAL;
  // resto de secretarías: sólo lo propio
  return (user?.secretaria || "") === (row.secretaria || "");
}

// ¿Puede MODERAR (aprobar / poner en revisión) ese pedido?
export function canModerate(user: AuthUser | null | undefined, row: BackendPedido): boolean {
  if (isEconomiaAdmin(user)) return true;
  const monto = toAmount(row.total);
  if (isAreaCompras(user)) return monto > UMBRAL;
  if (isSecretariaCompras(user)) return monto <= UMBRAL;
  return false;
}
