// src/lib/archivos.ts

import { API_BASE, authHeaders } from "@/lib/api";
import type { PedidoArchivo } from "@/lib/api";

/** Tipos de documento soportados por el backend */
export type TipoDoc =
  | "presupuesto_1"
  | "presupuesto_2"
  | "anexo1_obra"
  | "formal_pdf"
  | "expediente_1"
  | "expediente_2";

export const TIPOS_DOC: readonly TipoDoc[] = [
  "presupuesto_1",
  "presupuesto_2",
  "anexo1_obra",
  "formal_pdf",
  "expediente_1",
  "expediente_2",
] as const;

/** Devuelve true si la URL apunta a Supabase Storage */
export function isSupabaseUrl(u?: string | null): boolean {
  return !!u && u.startsWith("supabase://");
}

/** URL de descarga (redirect 307 a la firmada) cuando sabemos el ID del archivo */
export function downloadUrl(archivoId: number): string {
  return `${API_BASE}/archivos/${archivoId}/download`;
}

/** Normaliza una URL navegable */
export function fileUrl(rawUrl: string | null | undefined, archivoId?: number): string {
  if (!rawUrl) return "#";
  if (isSupabaseUrl(rawUrl) && typeof archivoId === "number") return downloadUrl(archivoId);
  if (rawUrl.startsWith("/")) return `${API_BASE}${rawUrl}`;
  return rawUrl;
}

/* =========================================================
 * Listar archivos de un pedido → GET /archivos/pedido/{id}
 * ========================================================= */
export async function listArchivos(pedidoId: number, token?: string): Promise<PedidoArchivo[]> {
  const res = await fetch(`${API_BASE}/archivos/pedido/${pedidoId}`, {
    cache: "no-store",
    headers: { Accept: "application/json", ...authHeaders(token) },
    mode: "cors",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  const items = (Array.isArray(data?.items) ? data.items : []) as PedidoArchivo[];
  return items.map(a => ({
    ...a,
    size_bytes: typeof a.size_bytes === "string" ? Number(a.size_bytes) : a.size_bytes,
    url: fileUrl(a.url, a.id),
  }));
}

/* =========================================================
 * Subir archivo (nueva versión) → POST /archivos/{pedido_id}
 *  → con fallback automático: primero con Authorization; si falla la red, reintenta sin Authorization
 * ========================================================= */
export async function uploadArchivo(
  pedidoId: number,
  tipo_doc: TipoDoc,
  file: File,
  token?: string
): Promise<{ ok: boolean; archivo_id: number; bytes: number; path: string; uploaded_at?: string }> {
  const fd = new FormData();
  fd.append("tipo_doc", tipo_doc);
  fd.append("archivo", file, file.name);

  const doPost = async (useAuth: boolean) => {
    const headers = useAuth ? { ...authHeaders(token) } : {};
    return fetch(`${API_BASE}/archivos/${pedidoId}`, {
      method: "POST",
      headers,               // NO fijar Content-Type con multipart
      body: fd,
      mode: "cors",
      redirect: "follow",
      cache: "no-store",
    });
  };

  // 1) Intento con Authorization (si hay token)
  let res: Response | null = null;
  let networkErr: any = null;
  const tryAuth = !!token;

  try {
    res = await doPost(tryAuth);
  } catch (e) {
    networkErr = e; // TypeError: Failed to fetch (p.ej. CORS/preflight)
  }

  // 2) Si hubo error de red o respuesta opaca/0, reintentar sin Authorization
  const needFallback =
    networkErr ||
    !res ||
    res.type === "opaque" ||
    res.type === "opaqueredirect" ||
    // algunos navegadores reportan status 0 en errores CORS
    // @ts-ignore (status puede ser 0 en opaco)
    (typeof res.status === "number" && res.status === 0);

  if (needFallback) {
    try {
      res = await doPost(false);
      networkErr = null; // limpiamos si el fallback logró emitir la request
    } catch (e2) {
      // Si también falla sin auth, devolvemos el mensaje más claro posible
      const hint =
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        String(process.env.NEXT_PUBLIC_API_BASE || "").startsWith("http://")
          ? " (Mixed Content: tu sitio está en HTTPS y la API en HTTP)"
          : "";
      throw new Error(`Failed to fetch${hint}`);
    }
  }

  if (!res!.ok) {
    // devolvemos el cuerpo del backend si viene; si no, el código
    let text = "";
    try { text = await res!.text(); } catch {}
    throw new Error(text || `HTTP ${res!.status}`);
  }

  return res!.json();
}

/* =========================================================
 * Review (aprobar / observar) → POST /archivos/{archivo_id}/review
 *  - soporta pasar X-User (revisor) en el header
 *  - body: multipart/form-data con fields 'decision' y (opcional) 'notes'
 * ========================================================= */
export async function reviewArchivo(
  archivoId: number,
  decision: "aprobado" | "observado",
  notes?: string | null,
  token?: string,
  xUser?: string
): Promise<{
  id: number;
  pedido_id: number;
  review_status: string;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}> {
  const fd = new FormData();
  fd.append("decision", decision);
  if (notes != null && String(notes).trim().length > 0) {
    fd.append("notes", String(notes).trim());
  }

  const headers: Record<string, string> = { ...authHeaders(token) };
  if (xUser && xUser.trim()) headers["X-User"] = xUser.trim();

  const res = await fetch(`${API_BASE}/archivos/${archivoId}/review`, {
    method: "POST",
    headers, // multipart: no fijar Content-Type
    body: fd,
    mode: "cors",
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}

/* =========================================================
 * URL firmada (si necesitás el link directo) → GET /archivos/{archivo_id}/signed
 * ========================================================= */
export async function getSignedUrl(
  archivoId: number,
  expiresSec = 600,
  token?: string
): Promise<{ url: string; file_name: string; content_type: string; expires_in: number }> {
  const res = await fetch(`${API_BASE}/archivos/${archivoId}/signed?expires_sec=${expiresSec}`, {
    cache: "no-store",
    headers: { Accept: "application/json", ...authHeaders(token) },
    mode: "cors",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}
