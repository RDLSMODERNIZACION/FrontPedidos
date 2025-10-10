// src/lib/pedidos.ts
'use client';

import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

/* =========================
 * Tipos
 * ========================= */
export type CreatePedidoResponse = {
  ok: true;
  pedido_id: number;
  numero: string;
  created_at: string;
};

export type PedidoArchivo = {
  id: number;
  kind: "formal_pdf" | "presupuesto_1" | "presupuesto_2" | "anexo1_obra" | string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;        // normalmente viene relativo: "/files/pedidos/<id>/formal.pdf"
  uploaded_at: string;
};

/* =========================
 * Utils
 * ========================= */
// Devuelve URL absoluta al backend para recursos estáticos (/files/…)
export function fileUrl(path: string) {
  if (!path) return "#";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

/* =========================
 * Pedidos — crear
 * ========================= */
export async function createPedidoFull(payload: any): Promise<CreatePedidoResponse> {
  const auth = loadAuth();
  const bodyStr = JSON.stringify(payload);
  // Evita problemas en PS 5.1 con Unicode y en navegadores antiguos:
  const bytes = new TextEncoder().encode(bodyStr);

  const res = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: {
      ...authHeaders(auth?.token),
      "Content-Type": "application/json; charset=utf-8",
    },
    body: bytes as any,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST /pedidos -> HTTP ${res.status} ${txt}`);
  }
  return await res.json() as CreatePedidoResponse;
}

/* =========================
 * Archivos — anexo de OBRA (ya existente)
 * ========================= */
export async function uploadAnexoObra(pedidoId: number, file: File) {
  const auth = loadAuth();
  const fd = new FormData();
  // el backend espera "file" para anexo1_obra
  fd.append("file", file, file.name);

  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos/anexo1_obra`, {
    method: "POST",
    headers: { ...authHeaders(auth?.token) }, // NO seteés Content-Type con FormData
    body: fd,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`upload anexo1_obra -> HTTP ${res.status} ${txt}`);
  }
  return await res.json() as { ok: boolean; archivo_id: number; storage_path: string };
}

/* =========================
 * Archivos — PDF formal firmado (nuevo)
 * ========================= */

// Lista archivos de un pedido desde /ui (alias: kind/filename/size_bytes/url/...)
export async function listPedidoArchivos(pedidoId: number): Promise<PedidoArchivo[]> {
  const auth = loadAuth();
  const r = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/archivos`, {
    headers: { ...authHeaders(auth?.token) },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`GET /ui/pedidos/${pedidoId}/archivos -> HTTP ${r.status} ${txt}`);
  }
  return await r.json();
}

// Sube/Reemplaza el formal con firma (tipo_doc='formal_pdf')
// Importante: el backend espera el campo "pdf" en el FormData.
export async function uploadPedidoFormalPdf(pedidoId: number, file: File): Promise<PedidoArchivo> {
  const auth = loadAuth();
  const fd = new FormData();
  fd.append("pdf", file, file.name);

  const r = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/archivo/formal`, {
    method: "POST",
    headers: { ...authHeaders(auth?.token) }, // NO pongas Content-Type manualmente
    body: fd,
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /ui/pedidos/${pedidoId}/archivo/formal -> HTTP ${r.status} ${txt}`);
  }
  return await r.json();
}
