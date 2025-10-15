// src/lib/proveedores.ts
import { http } from "@/lib/api";

/* =========================
 * Tipos
 * ========================= */
export type Proveedor = {
  id: number;
  cuit: string;
  razon_social: string | null;
  email_contacto?: string | null;
  telefono?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProveedorVinculado = {
  proveedor_id: number;
  cuit: string;
  razon_social: string | null;
  telefono: string | null;
  rol: "invitado" | "oferente" | "adjudicatario" | "consulta";
  updated_at: string | null;
};

/* =========================
 * Lectura / búsqueda
 * ========================= */
export async function buscarProveedores(q: string, limit = 10) {
  return http<
    Array<{
      id: number;
      cuit: string;
      razon_social: string;
      email_contacto?: string | null;
      telefono?: string | null;
    }>
  >(`/proveedores/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export async function getProveedorByCuit(cuit: string) {
  return http<Proveedor>(`/proveedores/by-cuit/${encodeURIComponent(cuit)}`);
}

export async function listarProveedoresDePedido(pedidoId: number, limit = 50) {
  return http<ProveedorVinculado[]>(
    `/proveedores/by-pedido/${pedidoId}?limit=${limit}`
  );
}

/* =========================
 * Crear / actualizar proveedor
 * ========================= */
export async function upsertProveedor(payload: {
  cuit: string;
  razon_social: string;
  telefono?: string;
  email_contacto?: string;
  transfer_if_in_use?: boolean;
}) {
  return http<Proveedor>(`/proveedores/upsert`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function upsertTelefono(payload: {
  cuit: string;
  telefono: string;
  transfer_if_in_use?: boolean;
}) {
  return http<Proveedor>(`/proveedores/upsert-telefono`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Editar proveedor por ID (razón/email/teléfono).
 *  Si querés permitir mover el teléfono desde otro proveedor, pasá transfer_if_in_use=true.
 */
export async function updateProveedor(
  proveedorId: number,
  payload: {
    razon_social?: string;
    email_contacto?: string;
    telefono?: string;
    transfer_if_in_use?: boolean;
  }
) {
  return http<Proveedor>(`/proveedores/${proveedorId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* =========================
 * Vínculo pedido <-> proveedor
 * ========================= */
export async function agregarProveedorAPedido(payload: {
  pedido_id: number;
  cuit: string;
  rol?: "invitado" | "oferente" | "adjudicatario" | "consulta";
  telefono?: string;
  razon_social?: string;
  email_contacto?: string;
  set_adjudicado?: boolean;
}) {
  return http<{
    ok: true;
    pedido: { id: number; numero: string; estado: string };
    proveedor: {
      id: number;
      cuit: string;
      razon_social: string | null;
      telefono: string | null;
    };
    rol: string;
    adjudicado_set: boolean;
  }>(`/proveedores/agregar-a-pedido`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Desvincular proveedor del pedido (borra fila en pedido_proveedor). */
export async function desvincularProveedorDePedido(
  pedidoId: number,
  proveedorId: number
) {
  return http<{ ok: true; removed: number }>(
    `/proveedores/pedido/${pedidoId}/${proveedorId}`,
    { method: "DELETE" }
  );
}
