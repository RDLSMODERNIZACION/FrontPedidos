// src/lib/pedidos-acciones.ts
// Acciones y edición de PEDIDOS (separado de api.ts para no crecerlo más)
import { http } from "@/lib/api";

export type PedidoDecision = "aprobar" | "observar" | "rechazar";

export interface DecidirPedidoBody {
  decision: PedidoDecision;
  notes?: string;       // obligatorio para observar/rechazar
  changed_by?: string;  // ej: usuario actual
}
export interface DecidirPedidoResponse {
  ok: boolean;
  estado: string;       // estado final del pedido
}

export interface UpdatePedidoBody {
  observaciones?: string | null;
  presupuesto_estimado?: number | null;
  fecha_desde?: string | null; // YYYY-MM-DD
  fecha_hasta?: string | null; // YYYY-MM-DD
  modulo_payload?: any;        // json
  ambito_payload?: any;        // json
}
export interface UpdatePedidoResponse {
  ok: boolean;
}

/** Aprobar / Observar / Rechazar un pedido (no PDFs) */
export async function decidirPedido(
  pedidoId: number,
  body: DecidirPedidoBody
) {
  return http<DecidirPedidoResponse>(`/pedidos/${pedidoId}/decision`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Editar campos del pedido (InfoTab) */
export async function updatePedido(
  pedidoId: number,
  body: UpdatePedidoBody
) {
  return http<UpdatePedidoResponse>(`/pedidos/${pedidoId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
