// src/lib/schemas.ts
import { z } from "zod";

/* =========================================================
 * BASE / GENERAL (se mantienen livianos; el foco es en módulos)
 * ========================================================= */
export const baseSchema = z.object({
  secretaria: z
    .string({ required_error: "Seleccioná una secretaría" })
    .min(1, "Seleccioná una secretaría")
    .optional(),
  id_tramite: z.string().optional(),
});

export const generalSchema = z.object({
  secretaria: z
    .string({ required_error: "Seleccioná una secretaría" })
    .min(1, "Seleccioná una secretaría"),
  observaciones: z.string().optional(),
  fecha_pedido: z.string().optional(), // ISO date (opcional)
});
export type GeneralInput = z.infer<typeof generalSchema>;

/* =========================================================
 * SERVICIOS
 *  - tipo_servicio: 'mantenimiento' | 'profesionales'
 *  - mantenimiento => requiere detalle_mantenimiento
 *  - profesionales => requiere tipo_profesional y (si hay fechas, coherencia)
 * ========================================================= */
export const serviciosSchema = z
  .object({
    // comunes
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    // tipos
    tipo_servicio: z.enum(["otros", "profesionales"], {
      required_error: "Elegí el tipo de servicio",
    }),

    // “otros”
    servicio_requerido: z.string().trim().optional(),
    destino_servicio: z.string().trim().optional(),

    // “profesionales”
    tipo_profesional: z.string().trim().optional(),
    dia_desde: z.string().trim().optional(),
    dia_hasta: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_servicio === "otros") {
      if (!data.servicio_requerido || data.servicio_requerido.trim().length < 3) {
        ctx.addIssue({
          path: ["servicio_requerido"],
          code: z.ZodIssueCode.custom,
          message: "Indicá el servicio (mín. 3 caracteres).",
        });
      }
      if (!data.destino_servicio || data.destino_servicio.trim().length < 3) {
        ctx.addIssue({
          path: ["destino_servicio"],
          code: z.ZodIssueCode.custom,
          message: "Indicá el destino del servicio (mín. 3 caracteres).",
        });
      }
      return; // no sigue validación de profesionales
    }

    // profesionales
    if (!data.tipo_profesional || data.tipo_profesional.trim().length < 3) {
      ctx.addIssue({
        path: ["tipo_profesional"],
        code: z.ZodIssueCode.custom,
        message: "Indicá el tipo de profesional (mín. 3 caracteres).",
      });
    }

    // Fechas coherentes si se informan
    const desde = data.dia_desde ? new Date(data.dia_desde) : null;
    const hasta = data.dia_hasta ? new Date(data.dia_hasta) : null;
    if ((desde && !hasta) || (!desde && hasta)) {
      ctx.addIssue({
        path: ["dia_hasta"],
        code: z.ZodIssueCode.custom,
        message: "Completá rango de fechas: desde y hasta.",
      });
    } else if (desde && hasta && hasta.getTime() < desde.getTime()) {
      ctx.addIssue({
        path: ["dia_hasta"],
        code: z.ZodIssueCode.custom,
        message: "La fecha 'hasta' no puede ser anterior a 'desde'.",
      });
    }
  });

export type ServiciosInput = z.infer<typeof serviciosSchema>;

/* =========================================================
 * ALQUILER
 *  - submodulo: 'edificio' | 'maquinaria' | 'otros'
 *  - edificio   => requiere direccion y rango de fechas válido
 *  - maquinaria => requiere al menos equipo o detalle
 *  - otros      => requiere detalle
 * ========================================================= */
export const alquilerSchema = z
  .object({
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    submodulo: z.enum(["edificio", "maquinaria", "otros"], {
      required_error: "Elegí una categoría de alquiler",
    }),

    // Edificio
    direccion: z.string().trim().optional(),
    fecha_desde: z.string().trim().optional(),
    fecha_hasta: z.string().trim().optional(),

    // Maquinaria
    equipo: z.string().trim().optional(),

    // Común / Otros
    detalle: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submodulo === "edificio") {
      if (!data.direccion || data.direccion.trim().length < 3) {
        ctx.addIssue({
          path: ["direccion"],
          code: z.ZodIssueCode.custom,
          message: "Ingresá la dirección del inmueble.",
        });
      }
      const d = data.fecha_desde ? new Date(data.fecha_desde) : null;
      const h = data.fecha_hasta ? new Date(data.fecha_hasta) : null;
      if (!d || !h) {
        ctx.addIssue({
          path: ["fecha_hasta"],
          code: z.ZodIssueCode.custom,
          message: "Indicá el rango de fechas (desde y hasta).",
        });
      } else if (h.getTime() < d.getTime()) {
        ctx.addIssue({
          path: ["fecha_hasta"],
          code: z.ZodIssueCode.custom,
          message: "La fecha 'hasta' no puede ser anterior a 'desde'.",
        });
      }
      return;
    }

    if (data.submodulo === "maquinaria") {
      const equipoOK = !!(data.equipo && data.equipo.trim().length >= 3);
      const detalleOK = !!(data.detalle && data.detalle.trim().length >= 5);
      if (!equipoOK && !detalleOK) {
        ctx.addIssue({
          path: ["equipo"],
          code: z.ZodIssueCode.custom,
          message: "Indicá el equipo a alquilar o agregá un detalle.",
        });
        ctx.addIssue({
          path: ["detalle"],
          code: z.ZodIssueCode.custom,
          message: "Escribí un detalle (mín. 5 caracteres) o completá 'Equipo'.",
        });
      }
      return;
    }

    // otros
    if (data.submodulo === "otros") {
      if (!data.detalle || data.detalle.trim().length < 5) {
        ctx.addIssue({
          path: ["detalle"],
          code: z.ZodIssueCode.custom,
          message: "Describí el alquiler (mín. 5 caracteres).",
        });
      }
    }
  });
export type AlquilerInput = z.infer<typeof alquilerSchema>;

/* =========================================================
 * ADQUISICIÓN
 *  - Debe tener al menos 1 ítem a comprar.
 *  - Cada ítem: descripción (>=3), cantidad (>0), unidad (opcional), precio_estimado (opcional >=0)
 * ========================================================= */
export const adquisicionItemSchema = z.object({
  descripcion: z.string().trim().min(3, "Descripción del ítem (mín. 3 caracteres)"),
  cantidad: z.coerce
    .number({ invalid_type_error: "Cantidad inválida" })
    .positive("Cantidad debe ser > 0"),
  unidad: z.string().trim().optional(),
  precio_estimado: z
    .union([z.coerce.number().nonnegative(), z.literal("").transform(() => undefined)])
    .optional(),
});

export const adquisicionSchema = z.object({
  secretaria: z.string().optional(),
  id_tramite: z.string().optional(),

  items: z.array(adquisicionItemSchema).min(1, "Agregá al menos un ítem"),
  observaciones: z.string().optional(),
});
export type AdquisicionInput = z.infer<typeof adquisicionSchema>;

/* =========================================================
 * REPARACIÓN
 *  - submodulo: 'maquinaria' | 'vehiculo' | 'otros'
 *  - "otros" => requiere que_reparar y detalle_reparacion
 *  - resto  => al menos 1 unidad o detalle
 * ========================================================= */
const unidadReparacionSchema = z.object({
  unidad_nro: z.string().trim().min(1, "Elegí una unidad"),
  marca: z.string().trim().optional(),
  dominio: z.string().trim().optional(),
  modelo: z.string().trim().optional(),
});

export const reparacionSchema = z
  .object({
    secretaria: z.string().optional(),
    id_tramite: z.string().optional(),

    submodulo: z.enum(["maquinaria", "vehiculo", "otros"], {
      required_error: "Elegí una categoría",
    }),

    // Selección de unidades (para maquinaria/vehículo)
    unidades: z.array(unidadReparacionSchema).default([]),

    // Campos del formulario (compatibles con tu UI)
    que_reparar: z.string().trim().optional(),
    detalle_reparacion: z.string().trim().optional(),

    // Alias común (por si tu form usa `detalle`)
    detalle: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const detalle =
      (data.detalle_reparacion && data.detalle_reparacion.trim()) ||
      (data.detalle && data.detalle.trim()) ||
      "";

    if (data.submodulo === "otros") {
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
      return;
    }

    // maquinaria / vehículo:
    const tieneUnidades = Array.isArray(data.unidades) && data.unidades.length > 0;
    const tieneDetalle = detalle.length >= 5;

    if (!tieneUnidades && !tieneDetalle) {
      ctx.addIssue({
        path: ["unidades"],
        code: z.ZodIssueCode.custom,
        message: "Seleccioná al menos una unidad o describí la reparación.",
      });
      ctx.addIssue({
        path: ["detalle_reparacion"],
        code: z.ZodIssueCode.custom,
        message: "Escribí un detalle (mín. 5 caracteres) o elegí una unidad.",
      });
    }
  });
export type ReparacionInput = z.infer<typeof reparacionSchema>;

/* =========================================================
 * (Stubs) OBRAS / MANTENIMIENTO DE ESCUELAS
 *   - Se exportan para no romper imports existentes.
 *   - Podés reemplazarlos por tus definiciones reales.
 * ========================================================= */
export const obrasSchema = z.object({}).catchall(z.any());
export type ObrasInput = z.infer<typeof obrasSchema>;

export const mantenimientodeescuelasSchema = z.object({}).catchall(z.any());
export type MantenimientoDeEscuelasInput = z.infer<typeof mantenimientodeescuelasSchema>;

/* =========================================================
 * COMBINADO / TYPE DE CREACIÓN (opcional, para tipar payloads)
 * ========================================================= */
export const pedidoSchema = z.object({
  general: generalSchema,
  modulo: z.enum(["servicios", "alquiler", "adquisicion", "reparacion"]),
  servicios: serviciosSchema.optional(),
  alquiler: alquilerSchema.optional(),
  adquisicion: adquisicionSchema.optional(),
  reparacion: reparacionSchema.optional(),
});
export type CreatePedidoInput = z.infer<typeof pedidoSchema>;
