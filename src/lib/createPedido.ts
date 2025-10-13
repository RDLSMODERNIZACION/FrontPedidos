// src/lib/createPedido.ts
import type { CreatePedidoInput } from "./schemas";
import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

/** Fecha YYYY-MM-DD (hoy) */
const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Creador de pedidos — envía SIEMPRE el payload v2 que espera el backend:
 * {
 *   generales: {...},
 *   ambitoIncluido: "ninguno" | "obra" | "mantenimientodeescuelas",
 *   especiales: { obra_nombre? | escuela? },
 *   modulo_seleccionado: "servicios" | "alquiler" | "adquisicion" | "reparacion",
 *   modulo_draft: { modulo, payload }
 * }
 */
export async function createPedido(input: CreatePedidoInput) {
  const auth = loadAuth();
  const secretariaSafe: string =
    (input as any)?.secretaria ??
    auth?.user?.secretaria ??
    auth?.user?.department ??
    auth?.user?.departamento ??
    "";

  const createdByUsername: string | undefined =
    (auth?.user?.username as string | undefined) ??
    (auth?.user?.email ? String(auth.user.email).split("@")[0] : undefined);

  const fecha_pedido: string | null = (input as any)?.fecha_pedido ?? todayISO();
  const fecha_desde: string | null = (input as any)?.fecha_desde ?? null;
  const fecha_hasta: string | null = (input as any)?.fecha_hasta ?? null;
  const presupuesto_estimado: number | string | null =
    (input as any)?.presupuesto_estimado ?? null;

  // Ambito v2
  let ambitoIncluido: "ninguno" | "obra" | "mantenimientodeescuelas" =
    ((input as any)?.ambitoIncluido as any) ??
    ((input as any)?.ambito?.tipo as any) ??
    "ninguno";
  if (ambitoIncluido === "general") ambitoIncluido = "ninguno";

  // especiales (solo cuando aplica)
  let especiales: Record<string, any> | undefined = undefined;
  if (ambitoIncluido === "obra") {
    const obra_nombre =
      (input as any)?.obra_nombre ??
      (input as any)?.nombre_obra ??
      (input as any)?.ambito?.obra?.obra_nombre ??
      null;
    if (obra_nombre) especiales = { obra_nombre };
  } else if (ambitoIncluido === "mantenimientodeescuelas") {
    const escuela =
      (input as any)?.escuela ??
      (input as any)?.ambito?.escuelas?.escuela ??
      null;
    if (escuela) especiales = { escuela };
  }

  const modulo = (input as any).modulo as
    | "servicios"
    | "alquiler"
    | "adquisicion"
    | "reparacion";

  let payload: Record<string, any> = {};
  switch (modulo) {
    case "servicios": {
      const tipo = (input as any).tipo_servicio as "mantenimiento" | "profesionales" | "otros";
      if (tipo === "profesionales") {
        payload = {
          tipo_profesional: (input as any).tipo_profesional ?? null,
          dia_desde: (input as any).dia_desde ?? null,
          dia_hasta: (input as any).dia_hasta ?? null,
        };
      } else {
        const detalle =
          (input as any).detalle_mantenimiento ??
          (input as any).servicio_requerido ??
          "";
        payload = {
          servicio_requerido: detalle,
          destino_servicio: (input as any).destino_servicio ?? null,
        };
      }
      break;
    }
    case "alquiler": {
      const cat = (input as any).categoria as "edificio" | "maquinaria" | "otros";
      if (cat === "edificio") {
        payload = {
          categoria: "edificio",
          uso_edificio: (input as any).uso_edificio ?? null,
          ubicacion_edificio: (input as any).ubicacion_edificio ?? null,
        };
      } else if (cat === "maquinaria") {
        payload = {
          categoria: "maquinaria",
          uso_maquinaria: (input as any).uso_maquinaria ?? null,
          tipo_maquinaria: (input as any).tipo_maquinaria ?? null,
          requiere_combustible: !!(input as any).requiere_combustible,
          requiere_chofer: !!(input as any).requiere_chofer,
          cronograma_desde: (input as any).cronograma_desde ?? null,
          cronograma_hasta: (input as any).cronograma_hasta ?? null,
          horas_por_dia: Number((input as any).horas_por_dia) || 0,
        };
      } else {
        payload = {
          categoria: "otros",
          que_alquilar: (input as any).que_alquilar ?? null,
          detalle_uso: (input as any).detalle_uso ?? null,
        };
      }
      break;
    }
    case "adquisicion": {
      const itemsRaw: any[] = Array.isArray((input as any).items) ? (input as any).items : [];
      const items = itemsRaw.map((it) => ({
        descripcion: it.descripcion,
        cantidad: Number(it.cantidad ?? 1),
        unidad: it.unidad ?? null,
        precio_unitario: it.precio_unitario != null ? Number(it.precio_unitario) : null,
      }));
      payload = {
        proposito: (input as any).proposito ?? null,
        modo_adquisicion: (input as any).modo_adquisicion ?? "uno",
        items,
      };
      break;
    }
    case "reparacion": {
      if ((input as any).tipo_reparacion === "maquinaria") {
        payload = {
          tipo_reparacion: "maquinaria",
          unidad_reparar: (input as any).unidad_reparar ?? null,
          detalle_reparacion: (input as any).detalle_reparacion ?? null,
        };
      } else {
        payload = {
          tipo_reparacion: "otros",
          que_reparar: (input as any).que_reparar ?? null,
          detalle_reparacion: (input as any).detalle_reparacion ?? null,
        };
      }
      break;
    }
  }

  const bodyV2 = {
    generales: {
      secretaria: secretariaSafe,
      estado: (input as any)?.estado ?? "enviado",
      fecha_pedido,
      fecha_desde,
      fecha_hasta,
      presupuesto_estimado,
      observaciones: (input as any)?.observaciones ?? null,
      created_by_username: createdByUsername,
    },
    ambitoIncluido,
    especiales: especiales ?? {},
    modulo_seleccionado: modulo,
    modulo_draft: { modulo, payload },
  };

  const res = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...authHeaders(auth?.token),
    },
    cache: "no-store",
    body: JSON.stringify(bodyV2),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`API ${res.status}${t ? ` — ${t}` : ""}`);
  }
  return res.json();
}
