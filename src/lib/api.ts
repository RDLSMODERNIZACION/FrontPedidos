// src/lib/api.ts

// =====================
// Tipos del backend
// =====================
export type BackendPedido = {
  id: number;
  id_tramite: string | null;      // ej: "EXP-2025-0003"
  modulo: string | null;          // "Servicios" | "Alquiler" | "Adquisición" | "Reparación" | null
  secretaria: string;
  solicitante: string | null;
  estado: string;                 // "borrador" | "enviado" | "en_revision" | "aprobado" | "rechazado" | "cerrado"
  total: number | string | null;  // puede venir como string desde SQL
  creado: string;                 // ISO (ej: "2025-10-10T01:54:52.186849Z")
  updated_at?: string;

  // Opcionales según la vista del backend
  tipo_ambito?: string;
  observaciones?: string | null;
  has_presupuesto_1?: boolean;
  has_presupuesto_2?: boolean;
  has_anexo1_obra?: boolean;
  secretaria_id?: number;
};

export type Paginated<T> = {
  items: T[];
  count: number;
  limit: number;
  offset: number;
  sort: string;
  filters: Record<string, any>;
};

// =====================
// Config base
// =====================
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

// =====================
// Helpers
// =====================
type HeaderMap = Record<string, string>;

/** Construye una URL con query params de forma segura */
function buildUrl(path: string, params?: Record<string, any>) {
  const url = new URL(path, API_BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

/** Headers auth (sin claves undefined) */
export function authHeaders(token?: string): HeaderMap {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Headers JSON + merge seguro */
function jsonHeaders(extra?: HeaderMap): HeaderMap {
  const base: HeaderMap = { Accept: "application/json; charset=utf-8" };
  return extra ? { ...base, ...extra } : base;
}

/** Manejo de errores HTTP con mensaje legible */
async function ensureOk(res: Response) {
  if (res.ok) return;
  let msg = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    if (text) msg += ` — ${text}`;
  } catch { /* noop */ }
  throw new Error(msg);
}

/* =========================================================
 * Pedidos (listado)
 * ========================================================= */

/**
 * Obtiene el listado paginado desde /ui/pedidos/list (backend real).
 * Ejemplo:
 *   getPedidos({ limit: 50, q: "escuelas", estado: "enviado", sort: "updated_at_desc" })
 */
export async function getPedidos(
  params?: {
    limit?: number;
    offset?: number;
    q?: string;
    estado?: string;
    sort?: string; // "updated_at_desc" | "created_at_desc" | "total_desc" | etc.
  },
  token?: string
) {
  const url = buildUrl("/ui/pedidos/list", params);
  // ✅ construir headers en una variable tipada evita el union raro en TS
  const headers: HeaderMap = jsonHeaders(authHeaders(token));

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });
  await ensureOk(res);
  return (await res.json()) as Paginated<BackendPedido>;
}

/* =========================================================
 * (Opcional) Detalle y opciones — útiles para futuras pantallas
 * Descomentá si los necesitás en el front.
 * ========================================================= */

// export type BackendPedidoDetalle = Record<string, any>;

// export async function getPedidoDetalle(pedidoId: number, token?: string) {
//   const url = buildUrl(`/ui/pedidos/${pedidoId}`);
//   const headers: HeaderMap = jsonHeaders(authHeaders(token));
//   const res = await fetch(url, { cache: "no-store", headers });
//   await ensureOk(res);
//   return (await res.json()) as BackendPedidoDetalle;
// }

// export async function getPedidosOptions(token?: string) {
//   const url = buildUrl("/ui/pedidos/options");
//   const headers: HeaderMap = jsonHeaders(authHeaders(token));
//   const res = await fetch(url, { cache: "no-store", headers });
//   await ensureOk(res);
//   return await res.json() as {
//     estados: string[];
//     secretarias: { id: number; nombre: string }[];
//     ambitos: string[];
//   };
// }
