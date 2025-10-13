// src/lib/createPedido.ts
import type { CreatePedidoInput } from "./schemas";
import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

/** YYYY-MM-DD (hoy) */
const todayISO = () => new Date().toISOString().slice(0, 10);

/* =========================
 * Helpers
 * ========================= */

function normalizedToken(): string | undefined {
  try {
    const t = loadAuth()?.token;
    return (t ?? undefined) as string | undefined;
  } catch {
    return undefined;
  }
}

/** Asegura un valor de ámbito soportado por el backend */
function normalizeAmbitoTipo(
  uiTipo?: string | null,
  amb?: { tipo?: string | null } | null
): "ninguno" | "obra" | "mantenimientodeescuelas" {
  let raw = (uiTipo ?? amb?.tipo ?? "ninguno") as string;
  if (raw === "general") raw = "ninguno";
  if (raw !== "ninguno" && raw !== "obra" && raw !== "mantenimientodeescuelas") {
    raw = "ninguno";
  }
  return raw as "ninguno" | "obra" | "mantenimientodeescuelas";
}

/** Duplica claves planas esperadas por backend legacy en `especiales` */
function withCompatEspeciales(
  ambitoIncluido: "ninguno" | "obra" | "mantenimientodeescuelas",
  ambito?: { payload?: Record<string, any> | null } | null,
  especiales?: Record<string, any> | null
) {
  const out: Record<string, any> = { ...(especiales ?? {}) };

  if (ambitoIncluido === "mantenimientodeescuelas") {
    const escuela =
      ambito?.payload?.escuela ??
      out?.mantenimientodeescuelas?.escuela ??
      out?.escuela;
    if (escuela) {
      out.mantenimientodeescuelas = { ...(out.mantenimientodeescuelas ?? {}), escuela };
      out.escuela = escuela; // plano para persistir en backend actual
    }
  }

  if (ambitoIncluido === "obra") {
    const obra_nombre =
      ambito?.payload?.obra_nombre ??
      out?.obra?.obra_nombre ??
      out?.obra_nombre;
    if (obra_nombre) {
      out.obra = { ...(out.obra ?? {}), obra_nombre };
      out.obra_nombre = obra_nombre; // plano para persistir en backend actual
    }
  }

  return out;
}

/** Si no es ISO (YYYY-MM-DD), la anulamos para no romper DB */
function coerceISODate(x: any): string | null {
  if (x == null) return null;
  const s = String(x).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/* =========================
 * Creador de pedidos (payload v2)
 * ========================= */

export async function createPedido(input: CreatePedidoInput) {
  const tk = normalizedToken();

  // 1) Generales
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

  // 2) Ámbito normalizado
  const ambitoIncluido = normalizeAmbitoTipo(
    (input as any)?.ambitoIncluido,
    (input as any)?.ambito ?? null
  );

  const ambito =
    ambitoIncluido === "ninguno"
      ? undefined
      : {
          tipo: ambitoIncluido,
          payload: (input as any)?.ambito?.payload ?? undefined,
        };

  // 3) Módulo (draft)
  const modulo = (input as any).modulo as
    | "servicios"
    | "alquiler"
    | "adquisicion"
    | "reparacion";

  let payload: Record<string, any> = {};
  switch (modulo) {
    case "servicios": {
      const tipo = (input as any).tipo_servicio as
        | "mantenimiento"
        | "profesionales"
        | "otros";
      if (tipo === "profesionales") {
        payload = {
          tipo_profesional: (input as any).tipo_profesional ?? null,
          dia_desde: coerceISODate((input as any).dia_desde),
          dia_hasta: coerceISODate((input as any).dia_hasta),
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
          cronograma_desde: coerceISODate((input as any).cronograma_desde),
          cronograma_hasta: coerceISODate((input as any).cronograma_hasta),
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
      const itemsRaw: any[] = Array.isArray((input as any).items)
        ? (input as any).items
        : [];
      const items = itemsRaw.map((it) => ({
        descripcion: it.descripcion,
        cantidad: Number(it.cantidad ?? 1),
        unidad: it.unidad ?? null,
        precio_unitario:
          it.precio_unitario != null ? Number(it.precio_unitario) : null,
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

  // 4) Especiales con compat (planas + anidadas)
  const especialesCompat = withCompatEspeciales(
    ambitoIncluido,
    ambito,
    (input as any)?.especiales ?? null
  );

  // 5) Body v2
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
    ...(ambito ? { ambito } : {}),
    ...(Object.keys(especialesCompat).length ? { especiales: especialesCompat } : { especiales: {} }),
    modulo_seleccionado: modulo,
    modulo_draft: { modulo, payload },
  };

  const res = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...authHeaders(tk),
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

export default createPedido;
