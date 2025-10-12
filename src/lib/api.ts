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

function readTokenFromStorage(): string | undefined {
  try {
    // Estructura { token, user, ... } usada por el AuthProvider
    const raw = localStorage.getItem("auth");
    if (raw) {
      const j = JSON.parse(raw);
      if (typeof j?.token === "string" && j.token.trim()) return j.token;
    }
    // Fallbacks comunes
    const flat = localStorage.getItem("token")
      ?? localStorage.getItem("access_token")
      ?? localStorage.getItem("jwt")
      ?? localStorage.getItem("idToken");
    if (flat && flat.trim()) return flat;
  } catch { /* noop */ }
  return undefined;
}

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

/** Headers auth (lee token automáticamente si no se pasa) */
export function authHeaders(token?: string): HeaderMap {
  const t = token ?? readTokenFromStorage();
  return t ? { Authorization: `Bearer ${t}` } : {};
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

/** Helper genérico por si querés reusar */
export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : new URL(path, API_BASE).toString();
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: jsonHeaders({ ...authHeaders(), ...(init?.headers as HeaderMap) }),
  });
  await ensureOk(res);
  return (await res.json()) as T;
}

/* =========================================================
 * Pedidos (listado)
 * ========================================================= */

/**
 * Obtiene el listado paginado desde /ui/pedidos/list (backend real).
 * Ejemplo:
 *   getPedidos({ limit: 50, q: "escuelas", estado: "enviado", sort: "updated_at_desc" })
 *
 * Nota: ya no hace falta pasar token; se lee de localStorage automáticamente.
 */
export async function getPedidos(
  params?: {
    limit?: number;
    offset?: number;
    q?: string;
    estado?: string;
    sort?: string; // "updated_at_desc" | "created_at_desc" | "total_desc" | etc.
  },
  token?: string // sigue soportado; si lo pasás, tiene prioridad
) {
  const url = buildUrl("/ui/pedidos/list", params);
  const headers: HeaderMap = jsonHeaders(authHeaders(token));
  const res = await fetch(url, { cache: "no-store", headers });
  await ensureOk(res);
  return (await res.json()) as Paginated<BackendPedido>;
}

/* =========================================================
 * (Opcional) Detalle y opciones — útiles para futuras pantallas
 * ========================================================= */

// export type BackendPedidoDetalle = Record<string, any>;

// export async function getPedidoDetalle(pedidoId: number, token?: string) {
//   return await http<BackendPedidoDetalle>(`/ui/pedidos/${pedidoId}`, {
//     headers: authHeaders(token),
//   });
// }

// export async function getPedidosOptions(token?: string) {
//   return await http<{
//     estados: string[];
//     secretarias: { id: number; nombre: string }[];
//     ambitos: string[];
//   }>(`/ui/pedidos/options`, { headers: authHeaders(token) });
// }
