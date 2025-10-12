// src/lib/createPedido.ts
import type { CreatePedidoInput } from "./schemas";
import { API_BASE, authHeaders } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

/**
 * Helpers locales (sin dependencias externas)
 */
const daysBetween = (a: string, b: string) =>
  Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));

const monthsBetweenApprox = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(
    1,
    (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth()) +
      (d2.getDate() >= d1.getDate() ? 0 : -1)
  );
};

const genIdTramite = () => {
  const y = new Date().getFullYear();
  const r = Math.floor(Math.random() * 10_000).toString().padStart(4, "0");
  return `EXP-${y}-${r}`;
};

/**
 * Creador de pedidos (envía Authorization y adjunta 'secretaria' si está disponible)
 */
export async function createPedido(input: CreatePedidoInput) {
  // `id_tramite` es opcional: si no viene, lo generamos.
  const maybe = (input as Partial<{ id_tramite?: string }>).id_tramite;
  const id_tramite =
    typeof maybe === "string" && maybe.trim().length > 0 ? maybe.trim() : genIdTramite();

  // Tomamos secretaria desde el input (si el form la trae) o desde el perfil persistido
  const auth = loadAuth();
  const secretariaSafe: string | null =
    (input as any)?.secretaria ??
    auth?.user?.secretaria ??
    auth?.user?.department ??
    auth?.user?.departamento ??
    null;

  let total = 0;
  let payload: Record<string, any> = {};

  switch (input.modulo) {
    case "servicios": {
      total = 0;
      const tipo = (input as any).tipo_servicio as "mantenimiento" | "profesionales";
      if (tipo === "mantenimiento") {
        payload = {
          tipo_servicio: "mantenimiento",
          detalle_mantenimiento: (input as any).detalle_mantenimiento,
        };
      } else {
        payload = {
          tipo_servicio: "profesionales",
          tipo_profesional: (input as any).tipo_profesional,
          dia_desde: (input as any).dia_desde,
          dia_hasta: (input as any).dia_hasta,
        };
      }
      break;
    }

    case "alquiler": {
      total = 0;
      const cat = (input as any).categoria as "edificio" | "maquinaria" | "otros";
      if (cat === "edificio") {
        payload = {
          categoria: "edificio",
          uso_edificio: (input as any).uso_edificio,
          ubicacion_edificio: (input as any).ubicacion_edificio,
        };
      } else if (cat === "maquinaria") {
        payload = {
          categoria: "maquinaria",
          uso_maquinaria: (input as any).uso_maquinaria,
          tipo_maquinaria: (input as any).tipo_maquinaria,
          requiere_combustible: !!(input as any).requiere_combustible,
          requiere_chofer: !!(input as any).requiere_chofer,
          cronograma_desde: (input as any).cronograma_desde,
          cronograma_hasta: (input as any).cronograma_hasta,
          horas_por_dia: Number((input as any).horas_por_dia) || 0,
        };
      } else {
        payload = {
          categoria: "otros",
          que_alquilar: (input as any).que_alquilar,
          detalle_uso: (input as any).detalle_uso,
        };
      }
      break;
    }

    case "adquisicion": {
      total = 0;
      payload = {
        proposito: (input as any).proposito,
        items: (input as any).items, // [{ descripcion, cantidad, unidad, observaciones }]
      };
      break;
    }

    case "reparacion": {
      total = 0;
      if ((input as any).tipo_reparacion === "maquinaria") {
        payload = {
          tipo_reparacion: "maquinaria",
          unidad_reparar: (input as any).unidad_reparar,
          detalle_reparacion: (input as any).detalle_reparacion,
        };
      } else {
        payload = {
          tipo_reparacion: "otros",
          que_reparar: (input as any).que_reparar,
          detalle_reparacion: (input as any).detalle_reparacion,
        };
      }
      break;
    }
  }

  // URL real del backend
  const url = `${API_BASE}/pedidos`;

  // Token (si existe) para Authorization
  const token = auth?.token ?? undefined;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...authHeaders(token),
    },
    cache: "no-store",
    body: JSON.stringify({
      id_tramite,
      modulo: input.modulo,
      total,
      // Enviamos secretaria arriba si el backend la espera allí (y también como metadato)
      secretaria: secretariaSafe,
      payload: {
        ...payload,
        _front: {
          ...(payload?._front ?? {}),
          secretaria: secretariaSafe,
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
