// src/lib/catalog.ts

// BASE del backend: en cliente usa NEXT_PUBLIC_API_BASE;
// en SSR acepta también API_BASE o VITE_API_BASE como fallback.
export const BASE =
  (typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE ||
      process.env.API_BASE ||
      process.env.VITE_API_BASE
    : process.env.NEXT_PUBLIC_API_BASE) ?? "https://backpedidos-gby7.onrender.com";

import { loadAuth } from "@/lib/auth";
import { authHeaders } from "@/lib/api";

/* ===== Tipos ===== */
export type Escuela = { id: number | null; nombre: string; ubicacion?: string | null };
export type ObraCat  = { id: number | null; nombre: string; ubicacion?: string | null };
export type Unidad   = {
  id: number;
  dominio: string | null;
  unidad_nro: number | null;
  marca?: string | null;
  modelo?: string | null;
  activa: boolean;
};

/* Utilidad: token normalizado a string | undefined (nunca null) */
function normalizedToken(): string | undefined {
  try {
    const t = loadAuth()?.token;
    return (t ?? undefined) as string | undefined;
  } catch {
    return undefined;
  }
}

/* ===== Escuelas ===== */
export async function listEscuelas(q?: string, activa: boolean = true): Promise<Escuela[]> {
  const url = new URL("/pedidos/catalogo/escuelas", BASE);
  if (q) url.searchParams.set("q", q);
  if (activa !== undefined) url.searchParams.set("activa", String(activa));
  const token = normalizedToken();
  const r = await fetch(url.toString(), {
    headers: { ...authHeaders(token) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`GET escuelas -> HTTP ${r.status}`);
  return await r.json();
}

export async function createEscuela(payload: { nombre: string; activa?: boolean }) {
  const token = normalizedToken();
  const r = await fetch(`${BASE}/pedidos/catalogo/escuelas`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`POST escuela -> HTTP ${r.status}: ${await r.text().catch(() => "")}`);
  return (await r.json()) as Escuela & { id: number };
}

/* ===== Obras ===== */
export async function listObras(q?: string, activa: boolean = true): Promise<ObraCat[]> {
  const url = new URL("/pedidos/catalogo/obras", BASE);
  if (q) url.searchParams.set("q", q);
  if (activa !== undefined) url.searchParams.set("activa", String(activa));
  const token = normalizedToken();
  const r = await fetch(url.toString(), {
    headers: { ...authHeaders(token) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`GET obras -> HTTP ${r.status}`);
  return await r.json();
}

export async function createObra(payload: { nombre: string; activa?: boolean }) {
  const token = normalizedToken();
  const r = await fetch(`${BASE}/pedidos/catalogo/obras`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`POST obra -> HTTP ${r.status}: ${await r.text().catch(() => "")}`);
  return (await r.json()) as ObraCat & { id: number };
}

/* ===== Unidades ===== */
export async function listUnidades(q?: string, activa: boolean = true): Promise<Unidad[]> {
  const url = new URL("/pedidos/catalogo/unidades", BASE);
  if (q) url.searchParams.set("q", q);
  if (activa !== undefined) url.searchParams.set("activa", String(activa));
  const token = normalizedToken();
  const r = await fetch(url.toString(), {
    headers: { ...authHeaders(token) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`GET unidades -> HTTP ${r.status}`);
  return await r.json();
}

export async function getUnidadByNumero(unidad_nro: number): Promise<Unidad> {
  const token = normalizedToken();
  const r = await fetch(`${BASE}/pedidos/catalogo/unidades/${unidad_nro}`, {
    headers: { ...authHeaders(token) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`GET unidad ${unidad_nro} -> HTTP ${r.status}`);
  return await r.json();
}
