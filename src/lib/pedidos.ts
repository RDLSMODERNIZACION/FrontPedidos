// src/lib/pedidos.ts
'use client';

import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

/* =========================
 * Tipos públicos
 * ========================= */
export type CreatePedidoResponse = {
  ok: true;
  pedido_id: number;
  numero: string;
  created_at: string;
};

/* =========================
 * Helpers
 * ========================= */
async function parseOrThrow<T = any>(res: Response, ctx: string): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const txt = await res.text().catch(() => "");
  throw new Error(`${ctx} -> HTTP ${res.status} ${txt}`);
}

/* =========================
 * Crear pedido (formato v2)
 * ========================= */
export async function createPedido(payload: any): Promise<CreatePedidoResponse> {
  const auth = loadAuth();
  const res = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(auth?.token),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return parseOrThrow<CreatePedidoResponse>(res, "POST /pedidos");
}

/** Alias de compatibilidad */
export const createPedidoFull = createPedido;
