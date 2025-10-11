// src/lib/schemas.ts
import { z } from "zod";

/* ===========================
 * Base común
 * =========================== */
export const baseSchema = z.object({
  // Opcional en tu UI, pero si viene debe tener al menos 1 char
  secretaria: z.string().min(1, "Seleccioná una secretaría").optional(),
  id_tramite: z.string().optional(),
  observaciones: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

/* ===========================
 * General (paso informativo)
 * =========================== */
export const generalSchema = baseSchema.extend({
  fecha_pedido: z.string().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
});

/* ===========================
 * Servicios
 * =========================== */
export const serviciosSchema = z
  .object({
    tipo_servicio: z.enum(["mantenimiento", "profesionales"]),
    // mantenimiento
    detalle_mantenimiento: z.string().optional(),
    // profesionales
    tipo_profesional: z.string().optional(),
    dia_desde: z.string().optional(),
    dia_hasta: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipo_servicio === "mantenimiento") {
      if (!v.detalle_mantenimiento || v.detalle_mantenimiento.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Describí el mantenimiento",
          path: ["detalle_mantenimiento"],
        });
      }
    } else {
      if (!v.tipo_profesional || v.tipo_profesional.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indicá el tipo de profesional",
          path: ["tipo_profesional"],
        });
      }
      if (!v.dia_desde || !v.dia_hasta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Completá el rango de días",
          path: ["dia_desde"],
        });
      }
    }
  });

/* ===========================
 * Alquiler
 * =========================== */
export const alquilerSchema = z
  .object({
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

/* ===========================
 * Adquisición
 * =========================== */
const itemSchema = z.object({
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.coerce.number().positive("Cantidad > 0"),
  unidad: z.string().optional(),
  observaciones: z.string().optional(),
});

export const adquisicionSchema = z.object({
  proposito: z.string().min(1, "Indicá el propósito"),
  items: z.array(itemSchema).min(1, "Agregá al menos un ítem"),
});

/* ===========================
 * Reparación
 * =========================== */
export const reparacionSchema = z
  .object({
    tipo_reparacion: z.enum(["maquinaria", "otros"]),
    // maquinaria
    unidad_reparar: z.coerce.number().optional(),
    // otros
    que_reparar: z.string().optional(),
    // común
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

/* ===========================
 * Obras (por si tu UI lo usa)
 * =========================== */
export const obrasSchema = z.object({
  proveedor: z.string().min(1, "Proveedor requerido"),
  obra_nombre: z.string().min(1, "Nombre de obra requerido"),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  monto_contrato: z.coerce.number().nonnegative("Monto inválido"),
  anticipo_pct: z.coerce.number().min(0).max(100).optional(),
});

/* ==========================================
 * Mantenimiento de Escuelas (si tu UI lo usa)
 * ========================================== */
export const mantenimientodeescuelasSchema = z.object({
  escuela: z.coerce.number(),
  proveedor: z.string().min(1, "Proveedor requerido"),
  descripcion: z.string().min(1, "Descripción requerida"),
  fecha: z.string().optional(),
  costo_estimado: z.coerce.number().nonnegative("Costo inválido"),
});

/* ===========================
 * CreatePedidoInput (union)
 * =========================== */
// Para alinear con createPedido.ts solo incluimos los módulos soportados allí.
// Si luego agregás "obras" o "mantenimientodeescuelas" al backend,
// extendé este union con sus literales.

const serviciosInput = serviciosSchema.extend({
  modulo: z.literal("servicios"),
  id_tramite: z.string().optional(),
});

const alquilerInput = alquilerSchema.extend({
  modulo: z.literal("alquiler"),
  id_tramite: z.string().optional(),
});

const adquisicionInput = adquisicionSchema.extend({
  modulo: z.literal("adquisicion"),
  id_tramite: z.string().optional(),
});

const reparacionInput = reparacionSchema.extend({
  modulo: z.literal("reparacion"),
  id_tramite: z.string().optional(),
});

export const createPedidoSchema = z.union([
  serviciosInput,
  alquilerInput,
  adquisicionInput,
  reparacionInput,
]);

export type CreatePedidoInput = z.infer<typeof createPedidoSchema>;
