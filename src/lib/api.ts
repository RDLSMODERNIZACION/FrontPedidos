// src/lib/api.ts

// =====================
// Tipos de backend
// =====================
export type BackendPedido = {
  id: number;
  id_tramite: string | null;
  modulo: string | null;            // o tipo_ambito según vista
  secretaria: string;
  solicitante: string | null;
  estado: "borrador" | "enviado" | "en_revision" | "aprobado" | "rechazado" | "cerrado";
  total: number | string | null;
  creado: string;                   // ISO
  updated_at?: string | null;

  // Opcionales según tu vista
  tipo_ambito?: string | null;
  observaciones?: string | null;
};

export type PedidosListResp = {
  items: BackendPedido[];
  count: number;
  limit: number;
  offset: number;
  sort: string;
  filters: Record<string, any>;
};

// =====================
// Helpers de fetch
// =====================
type HeaderMap = Record<string, string>;

export function authHeaders(token?: string): HeaderMap {
  // ✅ nunca devolvemos claves con undefined
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(extra?: HeaderMap): HeaderMap {
  const base: HeaderMap = { Accept: "application/json; charset=utf-8" };
  return extra ? { ...base, ...extra } : base;
}

function useMocks(): boolean {
  return process.env.NEXT_PUBLIC_API_BASE === "" || process.env.USE_MOCKS === "true";
}

function buildUrl(path: string): string {
  if (useMocks()) {
    // rutas internas de Next (/api) para mocks
    return `${process.env.NEXT_PUBLIC_VERCEL_URL ? "" : ""}/api${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return `${base}${path}`;
}

async function ensureOk(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
}

// =====================
// API genérica
// =====================
export async function api<T>(path: string, token?: string): Promise<T> {
  const url = buildUrl(path);
  const headers = jsonHeaders(authHeaders(token));
  const res = await fetch(url, { cache: "no-store", headers });
  await ensureOk(res);
  return (await res.json()) as T;
}

// =====================
// Endpoints concretos
// =====================
export async function getPedidos(params: {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: string;
  modulo?: string;
  sort?: "updated_at_desc" | "updated_at_asc" | "created_at_desc" | "created_at_asc" | "total_desc" | "total_asc";
  token?: string; // opcional por si tu backend requiere auth
}): Promise<PedidosListResp> {
  const qp = new URLSearchParams();
  if (params.limit != null) qp.set("limit", String(params.limit));
  if (params.offset != null) qp.set("offset", String(params.offset));
  if (params.q) qp.set("q", params.q);
  if (params.estado) qp.set("estado", params.estado);
  if (params.modulo) qp.set("modulo", params.modulo);
  qp.set("sort", params.sort ?? "updated_at_desc");

  const path = `/ui/pedidos/list?${qp.toString()}`;
  return await api<PedidosListResp>(path, params.token);
}
