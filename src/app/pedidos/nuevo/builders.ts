// src/app/pedidos/nuevo/builders.ts
import type { Ambito, ModNormal } from "./constants";

export function mapAmbitoToDb(a: Ambito | null): "general" | "obra" | "mant_escuela" {
  if (a === "obra") return "obra";
  if (a === "mantenimientodeescuelas") return "mant_escuela";
  return "general";
}

export function genIdTramite(): string {
  const y = new Date().getFullYear();
  const r = Math.floor(Math.random()*10000).toString().padStart(4,"0");
  return `EXP-${y}-${r}`;
}
