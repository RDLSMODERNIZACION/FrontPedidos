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
  path: string; // supabase://bucket/key  ó  "pedidos/<id>/archivo.pdf"
};

export type UiAnexoItem = {
  id: number;
  kind: "anexo1_obra" | "formal_pdf" | "presupuesto_1" | "presupuesto_2" | "expediente_1" | "expediente_2" | string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;

  // Ruta/URL que devuelve el backend. Puede venir como:
  // - supabase://bucket/object
  // - object path "pedidos/<id>/file.pdf"
  // - URL absoluta "https://..."
  url?: string | null;

  // Algunos backends devuelven estos alternativos:
  storage_path?: string | null;
  path?: string | null;

  uploaded_at?: string | null;
  download?: string | null;   // /pedidos/archivos/{id}/download (si backend lo agrega)

  // 🚀 nuevos campos de revisión (propagados desde /ui/pedidos/{id}/archivos)
  review_status?: "pendiente" | "aprobado" | "observado";
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
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

/** Compat con la UI de archivos (pestaña Archivos) */
export type PedidoArchivo = {
  id: number;
  kind: string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  url: string;                // ver comentario en UiAnexoItem
  uploaded_at: string | null;
  download?: string | null;

  // campos de revisión
  review_status?: "pendiente" | "aprobado" | "observado";
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;

  // opcionalmente pueden venir también:
  storage_path?: string | null;
  path?: string | null;
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

/* ========= Supabase public helper (para buckets públicos) ========= */

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "";

/** Convierte "pedidos/123/file.pdf" a URL pública de Supabase Storage. */
export function supaPublicObjectUrl(objectPath: string): string {
  if (!SUPA_URL || !SUPA_BUCKET) return "";
  const clean = objectPath.replace(/^\/+/, "");
  return `${SUPA_URL}/storage/v1/object/public/${encodeURIComponent(SUPA_BUCKET)}/` +
    clean.split("/").map(encodeURIComponent).join("/");
}

/** Convierte "supabase://bucket/key" a URL pública (si el bucket coincide o igualmente publicamos). */
export function supaPublicUrlFromUri(uri: string): string {
  // supabase://bucket/object/path.pdf
  const m = /^supabase:\/\/([^/]+)\/(.+)$/.exec(uri);
  if (!m) return uri;
  const bucket = m[1];
  const object = m[2];
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!base) return uri;
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/` +
    object.split("/").map(encodeURIComponent).join("/");
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
export async function uploadAnexo(
  pedidoId: number,
  tipoDoc: "anexo1_obra" | "formal_pdf" | "presupuesto_1" | "presupuesto_2" | "expediente_1" | "expediente_2",
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

/** ✅ Alias usado por ArchivoFormalUploader */
export async function uploadPedidoFormalPdf(pedidoId: number, file: File) {
  return uploadAnexo(pedidoId, "formal_pdf", file);
}

/* =========================
 * Upload formal (UI) — compatibilidad con endpoint antiguo UI
 * ========================= */
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

/** Compat: la página de “Archivos” usa listPedidoArchivos() */
export async function listPedidoArchivos(pedidoId: number): Promise<PedidoArchivo[]> {
  const { items } = await listAnexos(pedidoId);
  return (items || []).map((i: any) => ({
    id: Number(i.id),
    kind: String(i.kind ?? ""),
    filename: String(i.filename ?? ""),
    content_type: i.content_type ?? null,
    size_bytes: typeof i.size_bytes === "number" ? i.size_bytes : (i.size_bytes ? Number(i.size_bytes) : null),
    url: String(i.url ?? i.storage_path ?? i.path ?? ""), // unificamos en 'url'
    uploaded_at: (i.uploaded_at ?? null) as string | null,
    download: i.download ?? null,

    review_status: i.review_status ?? "pendiente",
    review_notes: i.review_notes ?? null,
    reviewed_by: i.reviewed_by ?? null,
    reviewed_at: i.reviewed_at ?? null,

    storage_path: i.storage_path ?? null,
    path: i.path ?? null,
  }));
}

/* =========================
 * Revisión de documentos (Aprobar / Observar)
 * ========================= */
export type ReviewDecision = "aprobado" | "observado";

export async function reviewArchivo(
  archivoId: number,
  decision: ReviewDecision,
  notes?: string | null
) {
  const auth = loadAuth();
  const r = await fetch(`${API_BASE}/ui/pedidos/archivos/${archivoId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(auth?.token) },
    body: JSON.stringify({ decision, notes: notes ?? null }),
  });
  return parseOrThrow(r, `POST /ui/pedidos/archivos/${archivoId}/review`);
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
 * Helpers de URL (compat + supabase)
 * ========================= */

/**
 * fileUrl (sobrecargas):
 * - fileUrl(item, {pedidoId}) => prioriza descarga por ID en tu backend y si no, URL pública de Supabase.
 * - fileUrl(path, archivoId?, pedidoId?) => compat histórica.
 */
export function fileUrl(
  item: { url?: string | null; storage_path?: string | null; path?: string | null; id?: number | null },
  opts?: { pedidoId?: number | null }
): string;
export function fileUrl(path: string, archivoId?: number, pedidoId?: number): string;
export function fileUrl(
  a: any,
  b?: any
): string {
  // Modo objeto (recomendado)
  if (typeof a === "object" && a !== null) {
    const pedidoId: number | null | undefined = b?.pedidoId ?? null;

    // 1) Preferí endpoint por ID en backend (redirige/firma en server)
    if (pedidoId && a.id) return `${API_BASE}/pedidos/${pedidoId}/archivos/${a.id}`;

    // 2) Supabase: si viene supabase://bucket/key
    const raw = (a.url ?? a.storage_path ?? a.path ?? "") as string;
    if (!raw) return "#";

    if (/^supabase:\/\//i.test(raw)) {
      const pub = supaPublicUrlFromUri(raw);
      if (pub) return pub;
    }

    // 3) Supabase object path "pedidos/123/file.pdf"
    if (!/^https?:\/\//i.test(raw)) {
      const pub = supaPublicObjectUrl(raw);
      if (pub) return pub;
      // si no hay config pública, devolvemos relativo al backend (último recurso)
      return `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
    }

    // 4) URL absoluta
    return raw;
  }

  // Modo string (compat)
  const path: string = a ?? "";
  const archivoId: number | undefined = b;
  const pedidoId: number | undefined = arguments.length >= 3 ? arguments[2] : undefined;

  if (!path) return "";
  // Si es referencia a supabase://... y no tenemos id -> usar pública
  if (path.startsWith("supabase://")) {
    return archivoId && pedidoId
      ? `${API_BASE}/pedidos/${pedidoId}/archivos/${archivoId}`
      : supaPublicUrlFromUri(path);
  }
  // Si ya es absoluta
  if (/^https?:\/\//i.test(path)) return path;
  // Si tenemos id+pedidoId, mejor usar endpoint por id
  if (archivoId && pedidoId) return `${API_BASE}/pedidos/${pedidoId}/archivos/${archivoId}`;
  // Relativa al backend
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** URL absoluta si el backend devolvió una ruta relativa */
export function absoluteUrl(path: string) {
  if (!path) return "";
  try {
    return new URL(path, API_BASE).toString();
  } catch {
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  }
}
