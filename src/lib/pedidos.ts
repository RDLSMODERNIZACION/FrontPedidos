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

export type UploadAnexoResponse = {
  ok: boolean;
  archivo_id: number;
  bytes: number;
  path: string; // supabase://bucket/key
};

export type UiAnexoItem = {
  id: number;
  kind: "anexo1_obra" | "formal_pdf" | "presupuesto_1" | "presupuesto_2" | string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  url?: string | null;        // supabase://...
  uploaded_at?: string | null;
  download?: string | null;   // /pedidos/archivos/{id}/download (si backend lo agrega)
};

export type UiAnexosList = {
  items: UiAnexoItem[];
};

export type SignedUrlResponse = {
  url: string;
  file_name?: string;
  content_type?: string;
  expires_in?: number;
};

/* =========================
 * Helpers
 * ========================= */
const MAX_MB = 100; // tope de 100 MB para adjuntos (ajustable)

function assertPdf(file: File) {
  if (!file) throw new Error("No se seleccionó archivo.");
  if (file.size <= 0) throw new Error("El archivo está vacío (0 bytes).");
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`El PDF supera el límite de ${MAX_MB} MB.`);
  }
  const isPdfMime = file.type === "application/pdf" || file.type === "";
  const isPdfName = /\.pdf$/i.test(file.name);
  if (!isPdfMime && !isPdfName) throw new Error("Solo se acepta PDF (.pdf).");
}

async function parseOrThrow<T = any>(res: Response, ctx: string): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const txt = await res.text().catch(() => "");
  throw new Error(`${ctx} -> HTTP ${res.status} ${txt}`);
}

/* =========================
 * Crear pedido
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
  });
  return parseOrThrow<CreatePedidoResponse>(res, "POST /pedidos");
}

/** 🔁 Alias para compatibilidad con código existente */
export const createPedidoFull = createPedido;

/* =========================
 * Upload de Anexos (nuevo endpoint + fallback legacy)
 * ========================= */
/**
 * Sube un anexo usando el endpoint NUEVO (Supabase Storage):
 *   POST /pedidos/{pedidoId}/archivos
 *   FormData: tipo_doc, archivo
 * Si el server devuelve 404 (deploy viejo), hace fallback al endpoint legacy:
 *   POST /pedidos/{pedidoId}/archivos/anexo1_obra
 *   FormData: file
 */
export async function uploadAnexo(
  pedidoId: number,
  tipoDoc: "anexo1_obra" | "formal_pdf" | "presupuesto_1" | "presupuesto_2",
  file: File
): Promise<UploadAnexoResponse> {
  assertPdf(file);
  const auth = loadAuth();

  // Intento 1: endpoint nuevo
  {
    const fd = new FormData();
    fd.append("tipo_doc", tipoDoc);
    fd.append("archivo", file, file.name);

    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos`, {
      method: "POST",
      headers: { ...authHeaders(auth?.token) }, // NO setear Content-Type manualmente
      body: fd,
    });

    if (res.status !== 404) {
      return parseOrThrow<UploadAnexoResponse>(res, `POST /pedidos/${pedidoId}/archivos`);
    }
    // si es 404 y tipoDoc no es anexo1_obra, no hay fallback posible
    if (tipoDoc !== "anexo1_obra") {
      const txt = await res.text().catch(() => "");
      throw new Error(`Endpoint no disponible para ${tipoDoc} (404). ${txt}`);
    }
  }

  // Fallback: endpoint legacy (solo anexo1_obra)
  const fdLegacy = new FormData();
  fdLegacy.append("file", file, file.name);

  const legacy = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos/anexo1_obra`, {
    method: "POST",
    headers: { ...authHeaders(loadAuth()?.token) },
    body: fdLegacy,
  });
  return parseOrThrow<UploadAnexoResponse>(legacy, `POST /pedidos/${pedidoId}/archivos/anexo1_obra`);
}

/** 🔁 Alias legacy (para código viejo que aún llame a uploadAnexoObra) */
export async function uploadAnexoObra(pedidoId: number, file: File) {
  return uploadAnexo(pedidoId, "anexo1_obra", file);
}

/* =========================
 * Upload formal (UI) — compatibilidad
 * ========================= */
/** Ruta UI existente: POST /ui/pedidos/{pedidoId}/archivo/formal (campo "pdf") */
export async function uploadFormalPdfUI(
  pedidoId: number,
  file: File
): Promise<{ ok: boolean; archivo_id: number; bytes?: number; path?: string }> {
  assertPdf(file);
  const auth = loadAuth();
  const fd = new FormData();
  fd.append("pdf", file, file.name);

  const r = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/archivo/formal`, {
    method: "POST",
    headers: { ...authHeaders(auth?.token) }, // NO setear Content-Type manualmente
    body: fd,
  });
  return parseOrThrow(r, `POST /ui/pedidos/${pedidoId}/archivo/formal`);
}

/* =========================
 * Listado de anexos por pedido (UI)
 * ========================= */
export async function listAnexos(pedidoId: number): Promise<UiAnexosList> {
  const auth = loadAuth();
  const r = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/archivos`, {
    headers: { ...authHeaders(auth?.token) },
  });
  return parseOrThrow<UiAnexosList>(r, `GET /ui/pedidos/${pedidoId}/archivos`);
}

/* =========================
 * Firmar y descargar
 * ========================= */
export async function getSignedUrl(archivoId: number): Promise<SignedUrlResponse> {
  const auth = loadAuth();
  const r = await fetch(`${API_BASE}/pedidos/archivos/${archivoId}/signed`, {
    headers: { ...authHeaders(auth?.token) },
  });
  return parseOrThrow<SignedUrlResponse>(r, `GET /pedidos/archivos/${archivoId}/signed`);
}

/** URL al redirect de descarga (307). Ideal para <a href={downloadUrl(id)} target="_blank"> */
export function downloadUrl(archivoId: number) {
  return `${API_BASE}/pedidos/archivos/${archivoId}/download`;
}

/* =========================
 * Helper de URL absoluta si el listado devuelve 'download' relativo
 * ========================= */
export function absoluteUrl(path: string) {
  if (!path) return "";
  try {
    // Si ya es absoluta, la devuelve igual
    return new URL(path, API_BASE).toString();
  } catch {
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  }
}
