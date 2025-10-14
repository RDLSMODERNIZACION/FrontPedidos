// src/lib/api.ts

// =====================
// Tipos del backend
// =====================

/** Fila del listado (/ui/pedidos/list) — alineado con ui_pedidos_listado */
export type BackendPedido = {
  id: number;
  id_tramite: string | null;              // ej: "EXP-2025-0003"
  secretaria: string | null;              // nombre de Secretaría (o null)
  estado: string | null;                  // "borrador" | "enviado" | ...
  total: number | string | null;          // viene como number/string/null desde SQL
  creado: string | null;                  // ISO o null
  updated_at: string | null;              // ISO o null
  // (intencionalmente SIN modulo / solicitante)
};

export type Paginated<T> = {
  items: T[];
  count: number;
  limit: number;
  offset: number;
  sort: string;
  filters: Record<string, any>;
};

/** Detalle compacto desde v_pedido_info (/ui/pedidos/{id}/info) */
export type PedidoInfo = {
  id: number;
  numero: string;
  fecha_pedido: string | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  presupuesto_estimado: number | string | null;
  observaciones: string | null;
  modulo_payload: any | null;   // objeto normalizado (payload del módulo)
  ambito_payload: any | null;   // objeto normalizado (payload del ámbito)
};

/** Archivo de pedido desde v_ui_pedido_archivos (/ui/pedidos/{id}/archivos) */
export type PedidoArchivo = {
  id: number;
  pedido_id: number;
  kind: string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  uploaded_at: string | null;
  review_status: string | null;
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  url: string;
};

/** Etapas del trámite desde v_pedido_etapas (/ui/pedidos/{id}/etapas) */
export type PedidoEtapas = {
  pedido_id?: number;

  // opcionales (por si la vista los expone; ayudan al timeline)
  estado?: string | null;
  estado_actual?: string | null;

  creado_at: string | null;
  enviado_at: string | null;
  en_revision_at: string | null;
  aprobado_at: string | null;
  en_proceso_at: string | null;
  area_pago_at: string | null;
  cerrado_at: string | null;
  formal_pdf_at: string | null;
  expediente_1_at: string | null;
  expediente_2_at: string | null;
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
    const raw = localStorage.getItem("auth");
    if (raw) {
      const j = JSON.parse(raw);
      if (typeof j?.token === "string" && j.token.trim()) return j.token;
    }
    const flat =
      localStorage.getItem("token") ??
      localStorage.getItem("access_token") ??
      localStorage.getItem("jwt") ??
      localStorage.getItem("idToken");
    if (flat && flat.trim()) return flat;
  } catch {
    /* noop */
  }
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
  const base: HeaderMap = {
    Accept: "application/json; charset=utf-8",
    "Content-Type": "application/json",
  };
  return extra ? { ...base, ...extra } : base;
}

/** Manejo de errores HTTP con mensaje legible */
async function ensureOk(res: Response) {
  if (res.ok) return;
  let msg = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    if (text) msg += ` — ${text}`;
  } catch {
    /* noop */
  }
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

/** Coerce seguro a número (para 'total' o 'presupuesto_estimado') */
function toNumber(x: unknown): number | null {
  if (x === null || x === undefined) return null;
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Parsea JSON cuando llega como string; retorna null si falla */
function safeJSON<T = any>(x: unknown): T | null {
  if (x === null || x === undefined) return null;
  if (typeof x === "object") return x as T;
  if (typeof x === "string") {
    const s = x.trim();
    if (!s) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      return s as unknown as T;
    }
  }
  return null;
}

/* =========================================================
 * Pedidos (listado)  →  GET /ui/pedidos/list
 * ========================================================= */
export async function getPedidos(
  params?: {
    limit?: number;
    offset?: number;
    q?: string;
    estado?: string;
    sort?: string; // "updated_at_desc" | "created_at_desc" | "total_desc" | etc.
  },
  token?: string // si lo pasás, tiene prioridad
): Promise<Paginated<BackendPedido>> {
  const url = buildUrl("/ui/pedidos/list", params);
  const headers: HeaderMap = jsonHeaders(authHeaders(token));
  const res = await fetch(url, { cache: "no-store", headers });
  await ensureOk(res);
  const data = (await res.json()) as Paginated<BackendPedido>;

  // Normalización mínima: si 'total' viene como string numérico => number; si null => null (NO 0)
  data.items = (data.items ?? []).map((r: any) => ({
    ...r,
    total: toNumber(r.total) ?? r.total,
    secretaria: r.secretaria ?? null,
    estado: r.estado ?? null,
    creado: r.creado ?? null,
    updated_at: r.updated_at ?? null,
  }));

  return data;
}

/* =========================================================
 * Pedido (info)  →  GET /ui/pedidos/{id}/info
 * ========================================================= */
export async function getPedidoInfo(pedidoId: number, token?: string): Promise<PedidoInfo> {
  const res = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/info`, {
    cache: "no-store",
    headers: jsonHeaders(authHeaders(token)),
  });
  await ensureOk(res);
  const raw = (await res.json()) as PedidoInfo;

  const info: PedidoInfo = {
    ...raw,
    presupuesto_estimado: toNumber(raw.presupuesto_estimado) ?? raw.presupuesto_estimado,
    modulo_payload: safeJSON(raw.modulo_payload),
    ambito_payload: safeJSON(raw.ambito_payload),
  };

  return info;
}

/* =========================================================
 * Pedido (archivos)  →  GET /ui/pedidos/{id}/archivos
 * ========================================================= */
export async function getPedidoArchivos(pedidoId: number, token?: string): Promise<PedidoArchivo[]> {
  const res = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/archivos`, {
    cache: "no-store",
    headers: jsonHeaders(authHeaders(token)),
  });
  await ensureOk(res);
  const data = await res.json();
  const items = (Array.isArray(data?.items) ? data.items : []) as PedidoArchivo[];
  return items.map((a) => ({
    ...a,
    size_bytes: typeof a.size_bytes === "string" ? Number(a.size_bytes) : a.size_bytes,
  }));
}

/* =========================================================
 * Pedido (etapas)  →  GET /ui/pedidos/{id}/etapas
 * ========================================================= */
export async function getPedidoEtapas(pedidoId: number, token?: string): Promise<PedidoEtapas> {
  const res = await fetch(`${API_BASE}/ui/pedidos/${pedidoId}/etapas`, {
    cache: "no-store",
    headers: jsonHeaders(authHeaders(token)),
  });
  await ensureOk(res);
  const raw = (await res.json()) as Partial<PedidoEtapas> | Record<string, never>;

  const def: PedidoEtapas = {
    pedido_id: typeof (raw as any)?.pedido_id === "number" ? (raw as any).pedido_id : pedidoId,
    estado: (raw as any)?.estado ?? null,
    estado_actual: (raw as any)?.estado_actual ?? null,

    creado_at: (raw as any)?.creado_at ?? null,
    enviado_at: (raw as any)?.enviado_at ?? null,
    en_revision_at: (raw as any)?.en_revision_at ?? null,
    aprobado_at: (raw as any)?.aprobado_at ?? null,
    en_proceso_at: (raw as any)?.en_proceso_at ?? null,
    area_pago_at: (raw as any)?.area_pago_at ?? null,
    cerrado_at: (raw as any)?.cerrado_at ?? null,
    formal_pdf_at: (raw as any)?.formal_pdf_at ?? null,
    expediente_1_at: (raw as any)?.expediente_1_at ?? null,
    expediente_2_at: (raw as any)?.expediente_2_at ?? null,
  };

  return def;
}

/* =========================================================
 * Diagnóstico rápido (opcional) — loguea API_BASE y prueba /health
 * ========================================================= */
export function apiDiagOnce() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__API_DIAGGED) return;
  w.__API_DIAGGED = true;

  try {
    // eslint-disable-next-line no-console
    console.info("[API_BASE]", API_BASE);

    fetch(new URL("/health", API_BASE).toString(), {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then((r) => r.text())
      // eslint-disable-next-line no-console
      .then((t) => console.info("[API_HEALTH]", t))
      // eslint-disable-next-line no-console
      .catch((e) => console.warn("[API_HEALTH_ERROR]", e));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[API_DIAG_ERROR]", e);
  }
}
