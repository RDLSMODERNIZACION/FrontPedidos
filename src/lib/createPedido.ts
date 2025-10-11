// src/lib/createPedido.ts
import type { CreatePedidoInput } from "./schemas";

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
 * Creador de pedidos (apunta a FastAPI si NEXT_PUBLIC_API_BASE está definido;
 * caso contrario usa las rutas mock locales /api/pedidos de Next.js)
 */
export async function createPedido(input: CreatePedidoInput) {
  // `id_tramite` es opcional: si no viene, lo generamos.
  const maybe = (input as Partial<{ id_tramite?: string }>).id_tramite;
  const id_tramite =
    typeof maybe === "string" && maybe.trim().length > 0 ? maybe.trim() : genIdTramite();

  let total = 0;
  let payload: Record<string, any> = {};

  switch (input.modulo) {
    case "servicios": {
      // Nueva UI: radios "mantenimiento" | "profesionales" (sin montos)
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
      // Nueva UI: categorías "edificio" | "maquinaria" | "otros" (sin montos)
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
      // La UI no maneja precios → total = 0
      total = 0;
      payload = {
        proposito: (input as any).proposito,
        items: (input as any).items, // [{ descripcion, cantidad, unidad, observaciones }]
      };
      break;
    }

    case "reparacion": {
      // Esta UI no tiene montos → total = 0
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

  // Si querés conservar metadatos front (p.ej. 'secretaria') en el backend,
  // podés incluirlos dentro del payload:
  // payload._front = { secretaria: input.general.secretaria, ... }

  const base = process.env.NEXT_PUBLIC_API_BASE;
  const url = base ? `${base}/pedidos` : `/api/pedidos`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    cache: "no-store",
    body: JSON.stringify({
      id_tramite,
      modulo: input.modulo,
      total,
      payload,
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
