// src/lib/vlateralapiget.ts
// Cliente para los endpoints de vlateral.py (overview, full, modulos, etapas, timeline)

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_BACKEND_BASE ??
  "https://backpedidos-gby7.onrender.com";

// Si usás auth por header, centralizalo acá
export function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwt") || sessionStorage.getItem("jwt")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ================= Tipos ================= */

export type PedidoArchivo = {
  id: number;
  kind: string;
  filename: string;
  size_bytes: number | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  uploaded_at: string | null;
  content_type: string | null;
  review_notes: string | null;
  storage_path: string | null;
  review_status: string | null;
};

export type HistorialEntry = {
  id: number;
  motivo: string | null;
  changed_by: string | null;
  created_at: string | null;
  estado_nuevo: string | null;
  estado_anterior: string | null;
};

export type PedidoOverviewItem = {
  id: number;
  numero: string;
  estado: string | null;
  secretaria: string | null;
  fecha_pedido: string | null;
  total: number | null;
  solicitante: string | null;
  ambito_tipo: string | null;
  modulo: string | null;
  archivos_count?: number | null;
  presupuestos_count?: number | null;
  formales_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OverviewResponse = {
  items: PedidoOverviewItem[];
  limit: number;
  offset: number;
  order: string;
  filters: {
    estado: string | null;
    secretaria_id: number | null;
    q: string | null;
  };
};

export type PedidoFull = {
  id: number;
  numero: string;
  estado: string | null;
  fecha_pedido: string | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  presupuesto_estimado: number | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  solicitante: string | null;
  secretaria_id: number | null;
  secretaria: string | null;
  ambito_tipo: string | null;

  // 👇 clave para el UI
  modulo: string | null;
  modulo_payload: unknown | null;

  // opcionales si el backend los adjunta
  modulos_payload?: Record<string, { table: string; rows: any[] }>;
  modulo_table?: string;

  ambito_payload: unknown | null;

  archivos: PedidoArchivo[];
  historial: HistorialEntry[];
  eventos: any[];
};

export type ModulosFound = Record<
  string,
  {
    table: string;
    rows: any[];
  }
>;

export type ModulosResponse = {
  found: ModulosFound;
};

/* ====== Nuevos tipos: Etapas + Timeline ====== */
export type Etapas = {
  pedido_id: number;
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

export type TimelineEntry = {
  kind: "estado" | "archivo";
  at: string;
  // estado:
  label?: string | null; // ej. 'borrador' para el nacimiento
  from?: string | null;
  to?: string | null;
  by?: string | null;
  motivo?: string | null;
  // archivo:
  filename?: string | null;
  content_type?: string | null;
  id?: number | null;
  bytes?: number | null;
};

export type PedidoTimeline = {
  etapas: Etapas | null;
  timeline: TimelineEntry[] | null;
};

/* =============== Fetch helper =============== */

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[${res.status}] ${res.statusText} → ${body}`);
  }
  return (await res.json()) as T;
}

/* =============== Endpoints UI =============== */

export function listOverview(params?: {
  limit?: number;
  offset?: number;
  estado?: string | null;
  secretaria_id?: number | null;
  q?: string | null;
  order?: "updated_desc" | "created_desc" | "total_desc" | "total_asc";
}) {
  const p = new URLSearchParams();
  if (params?.limit) p.set("limit", String(params.limit));
  if (params?.offset) p.set("offset", String(params.offset));
  if (params?.estado) p.set("estado", params.estado);
  if (params?.secretaria_id != null) p.set("secretaria_id", String(params.secretaria_id));
  if (params?.q) p.set("q", params.q);
  if (params?.order) p.set("order", params.order);
  const qs = p.toString() ? `?${p.toString()}` : "";
  return http<OverviewResponse>(`/ui/pedidos/overview${qs}`);
}

export function getPedidoFullById(pedidoId: number) {
  return http<PedidoFull>(`/ui/pedidos/${pedidoId}/full`);
}

export function getPedidoFullByNumero(numero: string) {
  const qs = `?numero=${encodeURIComponent(numero)}`;
  return http<PedidoFull>(`/ui/pedidos/full-by-numero${qs}`);
}

export function getPedidoModulos(pedidoId: number) {
  return http<ModulosResponse>(`/ui/pedidos/${pedidoId}/modulos`);
}

/* =============== Endpoints nuevos: etapas + timeline =============== */

export function getPedidoEtapas(pedidoId: number) {
  return http<Etapas | {}>(`/ui/pedidos/${pedidoId}/etapas`);
}

export function getPedidoTimeline(pedidoId: number) {
  return http<PedidoTimeline>(`/ui/pedidos/${pedidoId}/timeline`);
}
