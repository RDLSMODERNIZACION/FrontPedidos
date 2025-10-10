// src/lib/pedidos.ts
'use client';

import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export async function createPedidoFull(payload: any) {
  const auth = loadAuth();
  const bodyStr = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(bodyStr); // PS 5.1 safe, navegador ok

  const res = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: {
      ...authHeaders(auth?.token),
      "Content-Type": "application/json; charset=utf-8",
    },
    body: bytes as any,
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`POST /pedidos -> HTTP ${res.status} ${txt}`);
  }
  return await res.json() as { ok: true; pedido_id: number; numero: string; created_at: string };
}

export async function uploadAnexoObra(pedidoId: number, file: File) {
  const auth = loadAuth();
  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos/anexo1_obra`, {
    method: "POST",
    headers: { ...authHeaders(auth?.token) }, // NO pongas Content-Type aquí
    body: fd,
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error(`upload anexo1_obra -> HTTP ${res.status} ${txt}`);
  }
  return await res.json() as { ok: boolean; archivo_id: number; storage_path: string };
}
