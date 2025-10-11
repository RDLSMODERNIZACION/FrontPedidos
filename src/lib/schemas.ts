// src/lib/schemas.ts
import { z } from "zod";

/* =========================================================
 * BASE / GENERAL
 * ========================================================= */
export const baseSchema = z.object({
  // Opcional; si viene, no puede ser vacío
  secretaria: z.string().min(1, "Seleccioná una secretaría").optional(),
  id_tramite: z.string().optional(),
});

export const generalSchema = baseSchema.extend({
  observaciones: z.string().optional(),
  fecha_pedido: z.string().optional(), // ISO date (opcional)
});
export type GeneralInput = z.infer<typeof generalSchema>;

/* =========================================================
 * SERVICIOS (UI schema)
 *  - tipo_servicio: 'mantenimiento' | 'profesionales'
 * ========================================================= */
export const serviciosSchema = z
  .object({
    // comunes opcionales que puede usar la UI
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    tipo_servicio: z.enum(["mantenimiento", "profesionales"]),
    // mantenimiento
    detalle_mantenimiento: z.string().optional(),
    // profesionales
    tipo_profesional: z.string().optional(),
    dia_desde: z.string().optional(),
    dia_hasta: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_servicio === "mantenimiento") {
      if (!data.detalle_mantenimiento || data.detalle_mantenimiento.trim().length < 3) {
        ctx.addIssue({
          path: ["detalle_mantenimiento"],
          code: z.ZodIssueCode.custom,
          message: "Describí el mantenimiento (mín. 3 caracteres).",
        });
      }
      return;
    }
    // profesionales
    if (!data.tipo_profesional || data.tipo_profesional.trim().length < 3) {
      ctx.addIssue({
        path: ["tipo_profesional"],
        code: z.ZodIssueCode.custom,
        message: "Indicá el tipo de profesional (mín. 3 caracteres).",
      });
    }
    if (!data.dia_desde || !data.dia_hasta) {
      ctx.addIssue({
        path: ["dia_desde"],
        code: z.ZodIssueCode.custom,
        message: "Completá rango de días (desde y hasta).",
      });
    } else {
      const d = new Date(data.dia_desde);
      const h = new Date(data.dia_hasta);
      if (h.getTime() < d.getTime()) {
        ctx.addIssue({
          path: ["dia_hasta"],
          code: z.ZodIssueCode.custom,
          message: "La fecha 'hasta' no puede ser anterior a 'desde'.",
        });
      }
    }
  });
export type ServiciosInput = z.infer<typeof serviciosSchema>;

/* =========================================================
 * ALQUILER (UI schema)
 *  - categoria: 'edificio' | 'maquinaria' | 'otros'
 * ========================================================= */
export const alquilerSchema = z
  .object({
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    categoria: z.enum(["edificio", "maquinaria", "otros"]),

    // edificio
    uso_edificio: z.string().optional(),
    ubicacion_edificio: z.string().optional(),

    // maquinaria
    uso_maquinaria: z.string().optional(),
    tipo_maquinaria: z.string().optional(),
    requiere_combustible: z.boolean().optional().default(false),
    requiere_chofer: z.boolean().optional().default(false),
    cronograma_desde: z.string().optional(),
    cronograma_hasta: z.string().optional(),
    horas_por_dia: z.coerce.number().optional().default(0),

    // otros
    que_alquilar: z.string().optional(),
    detalle_uso: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    switch (v.categoria) {
      case "edificio": {
        if (!v.uso_edificio || !v.ubicacion_edificio) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Completá uso y ubicación del edificio",
          });
        }
        break;
      }
      case "maquinaria": {
        if (!v.uso_maquinaria || !v.tipo_maquinaria) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Completá uso y tipo de maquinaria",
          });
        }
        if ((v.cronograma_desde && !v.cronograma_hasta) || (!v.cronograma_desde && v.cronograma_hasta)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Completá el rango de fechas de cronograma",
            path: ["cronograma_desde"],
          });
        }
        if (v.cronograma_desde && v.cronograma_hasta) {
          const d = new Date(v.cronograma_desde);
          const h = new Date(v.cronograma_hasta);
          if (h.getTime() < d.getTime()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "La fecha 'hasta' no puede ser anterior a 'desde'.",
              path: ["cronograma_hasta"],
            });
          }
        }
        break;
      }
      case "otros": {
        if (!v.que_alquilar || !v.detalle_uso) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indicá qué alquilar y su uso",
          });
        }
        break;
      }
    }
  });
export type AlquilerInput = z.infer<typeof alquilerSchema>;

/* =========================================================
 * ADQUISICIÓN (UI schema)
 * ========================================================= */
export const adquisicionItemSchema = z.object({
  descripcion: z.string().trim().min(3, "Descripción del ítem (mín. 3 caracteres)"),
  cantidad: z.coerce.number().positive("Cantidad debe ser > 0"),
  unidad: z.string().trim().optional(),
  // en UI puede venir vacío; lo toleramos
  precio_estimado: z.union([z.coerce.number().nonnegative(), z.literal("").transform(() => undefined)]).optional(),
});

export const adquisicionSchema = z.object({
  secretaria: z.string().optional(),
  id_tramite: z.string().optional(),

  items: z.array(adquisicionItemSchema).min(1, "Agregá al menos un ítem"),
  observaciones: z.string().optional(),
});
export type AdquisicionInput = z.infer<typeof adquisicionSchema>;

/* =========================================================
 * REPARACIÓN (UI schema)
 *  - tipo_reparacion: 'maquinaria' | 'otros'
 * ========================================================= */
export const reparacionSchema = z
  .object({
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    tipo_reparacion: z.enum(["maquinaria", "otros"]),
    // maquinaria
    unidad_reparar: z.coerce.number().optional(),
    // otros
    que_reparar: z.string().optional(),
    // común
    detalle_reparacion: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const detalle = (data.detalle_reparacion ?? "").trim();

    if (data.tipo_reparacion === "maquinaria") {
      if (data.unidad_reparar == null || Number.isNaN(data.unidad_reparar)) {
        ctx.addIssue({
          path: ["unidad_reparar"],
          code: z.ZodIssueCode.custom,
          message: "Seleccioná la unidad a reparar",
        });
      }
      if (detalle.length < 5) {
        ctx.addIssue({
          path: ["detalle_reparacion"],
          code: z.ZodIssueCode.custom,
          message: "Describí la reparación (mín. 5 caracteres).",
        });
      }
      return;
    }

    // otros
    if (!data.que_reparar || data.que_reparar.trim().length < 3) {
      ctx.addIssue({
        path: ["que_reparar"],
        code: z.ZodIssueCode.custom,
        message: "Indicá qué hay que reparar (mín. 3 caracteres).",
      });
    }
    if (detalle.length < 5) {
      ctx.addIssue({
        path: ["detalle_reparacion"],
        code: z.ZodIssueCode.custom,
        message: "Describí la reparación (mín. 5 caracteres).",
      });
    }
  });
export type ReparacionInput = z.infer<typeof reparacionSchema>;

/* =========================================================
 * (Stubs) OBRAS / MANTENIMIENTO DE ESCUELAS
 *   - Exportados para no romper imports existentes.
 * ========================================================= */
export const obrasSchema = z.object({}).catchall(z.any());
export type ObrasInput = z.infer<typeof obrasSchema>;

export const mantenimientodeescuelasSchema = z.object({}).catchall(z.any());
export type MantenimientoDeEscuelasInput = z.infer<typeof mantenimientodeescuelasSchema>;

/* =========================================================
 * CREATE PEDIDO INPUT (UNION DISCRIMINADA para el backend)
 *   Definimos cada variante SIN extender un schema con refinamientos.
 * ========================================================= */
const serviciosInput = z
  .object({
    modulo: z.literal("servicios"),
    id_tramite: z.string().optional(),
    tipo_servicio: z.enum(["mantenimiento", "profesionales"]),
    detalle_mantenimiento: z.string().optional(),
    tipo_profesional: z.string().optional(),
    dia_desde: z.string().optional(),
    dia_hasta: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipo_servicio === "mantenimiento") {
      if (!v.detalle_mantenimiento || v.detalle_mantenimiento.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Describí el mantenimiento (mín. 3 caracteres).",
          path: ["detalle_mantenimiento"],
        });
      }
    } else {
      if (!v.tipo_profesional || v.tipo_profesional.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indicá el tipo de profesional (mín. 3 caracteres).",
          path: ["tipo_profesional"],
        });
      }
      if (!v.dia_desde || !v.dia_hasta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Completá rango de días (desde y hasta).",
          path: ["dia_desde"],
        });
      } else {
        const d = new Date(v.dia_desde);
        const h = new Date(v.dia_hasta);
        if (h.getTime() < d.getTime()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha 'hasta' no puede ser anterior a 'desde'.",
            path: ["dia_hasta"],
          });
        }
      }
    }
  });

const alquilerInput = z
  .object({
    modulo: z.literal("alquiler"),
    id_tramite: z.string().optional(),
    categoria: z.enum(["edificio", "maquinaria", "otros"]),
    uso_edificio: z.string().optional(),
    ubicacion_edificio: z.string().optional(),
    uso_maquinaria: z.string().optional(),
    tipo_maquinaria: z.string().optional(),
    requiere_combustible: z.boolean().optional().default(false),
    requiere_chofer: z.boolean().optional().default(false),
    cronograma_desde: z.string().optional(),
    cronograma_hasta: z.string().optional(),
    horas_por_dia: z.coerce.number().optional().default(0),
    que_alquilar: z.string().optional(),
    detalle_uso: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    switch (v.categoria) {
      case "edificio":
        if (!v.uso_edificio || !v.ubicacion_edificio) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Completá uso y ubicación del edificio",
          });
        }
        break;
      case "maquinaria":
        if (!v.uso_maquinaria || !v.tipo_maquinaria) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Completá uso y tipo de maquinaria",
          });
        }
        break;
      case "otros":
        if (!v.que_alquilar || !v.detalle_uso) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indicá qué alquilar y su uso",
          });
        }
        break;
    }
  });

const itemSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.coerce.number().positive(),
  unidad: z.string().optional(),
  observaciones: z.string().optional(),
});

const adquisicionInput = z.object({
  modulo: z.literal("adquisicion"),
  id_tramite: z.string().optional(),
  proposito: z.string().min(1, "Indicá el propósito"),
  items: z.array(itemSchema).min(1, "Agregá al menos un ítem"),
});

const reparacionInput = z
  .object({
    modulo: z.literal("reparacion"),
    id_tramite: z.string().optional(),
    tipo_reparacion: z.enum(["maquinaria", "otros"]),
    unidad_reparar: z.coerce.number().optional(),
    que_reparar: z.string().optional(),
    detalle_reparacion: z.string().min(1, "Describí la reparación"),
  })
  .superRefine((v, ctx) => {
    if (v.tipo_reparacion === "maquinaria") {
      if (v.unidad_reparar == null || Number.isNaN(v.unidad_reparar)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccioná la unidad a reparar",
          path: ["unidad_reparar"],
        });
      }
    } else {
      if (!v.que_reparar || v.que_reparar.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indicá qué hay que reparar",
          path: ["que_reparar"],
        });
      }
    }
  });

export const createPedidoSchema = z.discriminatedUnion("modulo", [
  serviciosInput,
  alquilerInput,
  adquisicionInput,
  reparacionInput,
]);

export type CreatePedidoInput = z.infer<typeof createPedidoSchema>;
