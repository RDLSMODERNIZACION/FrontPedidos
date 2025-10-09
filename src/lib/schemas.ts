// src/lib/schemas.ts
import { z } from "zod";

/* ===============================
 * Helpers
 * =============================== */
const nonEmpty  = (label: string) => z.string().min(1, `${label} requerido`);
const dateStr   = (label: string) => z.string().min(1, `${label} requerido`); // YYYY-MM-DD
const diaSemana = z.enum(["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]);

/* ===============================
 * Campos comunes (se agregan a todos)
 * =============================== */
export const baseSchema = z.object({
  id_tramite: z.string().optional(),
  secretaria: nonEmpty("Secretaría"),
});

/* ===============================
 * Módulo: GENERAL (según UI)
 * =============================== */
export const generalSchema = z
  .object({
    modulo: z.literal("general"),
    fecha_pedido: dateStr("Fecha de pedido"),
    fecha_desde:  dateStr("Fecha desde"),
    fecha_hasta:  dateStr("Fecha hasta"),
    presupuesto_estimado: z.coerce.number().nonnegative("Monto inválido"),
    observaciones: z.string().optional().default(""),
  })
  .superRefine((v, ctx) => {
    const d1 = new Date(v.fecha_desde).getTime();
    const d2 = new Date(v.fecha_hasta).getTime();
    if (!Number.isNaN(d1) && !Number.isNaN(d2) && d1 > d2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fecha_hasta"], message: "Debe ser igual o posterior a la fecha desde" });
    }
  });

/* ===============================
 * Módulo: SERVICIOS (radios: mantenimiento | profesionales)
 * =============================== */
export const serviciosSchema = z
  .object({
    modulo: z.literal("servicios"),
    tipo_servicio: z.enum(["mantenimiento","profesionales"]),

    // mantenimiento
    detalle_mantenimiento: z.string().optional(),

    // profesionales
    tipo_profesional: z.string().optional(),
    dia_desde: diaSemana.optional(),
    dia_hasta: diaSemana.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipo_servicio === "mantenimiento") {
      if (!v.detalle_mantenimiento || v.detalle_mantenimiento.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["detalle_mantenimiento"], message: "Describa el mantenimiento requerido" });
      }
    }
    if (v.tipo_servicio === "profesionales") {
      if (!v.tipo_profesional || v.tipo_profesional.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tipo_profesional"], message: "Indique el tipo de profesional" });
      }
      if (!v.dia_desde) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dia_desde"], message: "Seleccione día desde" });
      if (!v.dia_hasta) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dia_hasta"], message: "Seleccione día hasta" });
    }
  });

/* ===============================
 * Módulo: ALQUILER (radios: edificio | maquinaria | otros)
 * =============================== */
export const alquilerSchema = z
  .object({
    modulo: z.literal("alquiler"),
    categoria: z.enum(["edificio","maquinaria","otros"]),

    // Edificio
    uso_edificio: z.string().optional(),
    ubicacion_edificio: z.string().optional(),

    // Maquinaria
    uso_maquinaria: z.string().optional(),
    tipo_maquinaria: z.string().optional(),
    requiere_combustible: z.boolean().optional().default(false),
    requiere_chofer: z.boolean().optional().default(false),
    cronograma_desde: diaSemana.optional(),
    cronograma_hasta: diaSemana.optional(),
    horas_por_dia: z.coerce.number().optional(),

    // Otros
    que_alquilar: z.string().optional(),
    detalle_uso: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.categoria === "edificio") {
      if (!v.uso_edificio || v.uso_edificio.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["uso_edificio"], message: "Indique el uso del edificio" });
      }
      if (!v.ubicacion_edificio || v.ubicacion_edificio.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ubicacion_edificio"], message: "Indique la ubicación" });
      }
    }

    if (v.categoria === "maquinaria") {
      if (!v.uso_maquinaria || v.uso_maquinaria.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["uso_maquinaria"], message: "Indique el uso de la maquinaria" });
      }
      if (!v.tipo_maquinaria || v.tipo_maquinaria.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tipo_maquinaria"], message: "Seleccione el tipo de maquinaria" });
      }
      if (!v.cronograma_desde) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cronograma_desde"], message: "Seleccione día inicial" });
      }
      if (!v.cronograma_hasta) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cronograma_hasta"], message: "Seleccione día final" });
      }
      if (v.horas_por_dia == null || isNaN(Number(v.horas_por_dia)) || Number(v.horas_por_dia) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["horas_por_dia"], message: "Horas por día inválidas" });
      }
    }

    if (v.categoria === "otros") {
      if (!v.que_alquilar || v.que_alquilar.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["que_alquilar"], message: "Indique qué se desea alquilar" });
      }
      if (!v.detalle_uso || v.detalle_uso.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["detalle_uso"], message: "Detalle el uso" });
      }
    }
  });

/* ===============================
 * Módulo: ADQUISICIÓN (con ítems)
 * =============================== */
export const itemCompraSchema = z.object({
  descripcion:  z.string().min(1, "Descripción requerida"),
  cantidad:     z.coerce.number().positive("Cantidad inválida"),
  unidad:       z.string().min(1, "Unidad requerida"),
  observaciones: z.string().optional().default(""),
});
export type ItemCompra = z.infer<typeof itemCompraSchema>;

export const adquisicionSchema = z.object({
  modulo: z.literal("adquisicion"),
  proposito: z.string().min(1, "Indique para qué es la compra"),
  items: z.array(itemCompraSchema).min(1, "Agregue al menos un ítem"),
});

/* ===============================
 * Módulo: SERVICIOS DE EXTENSIÓN
 * =============================== */
export const serviciosextensionSchema = z
  .object({
    modulo: z.literal("serviciosextension"),
    proveedor: nonEmpty("Proveedor"),
    descripcion: z.string().min(3, "Descripción muy corta"),
    horas: z.coerce.number().positive("Horas inválidas"),
    tarifa_hora: z.coerce.number().positive("Tarifa inválida"),
    fecha_desde: z.string().optional(),
    fecha_hasta: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.fecha_desde && v.fecha_hasta) {
      const d1 = new Date(v.fecha_desde).getTime();
      const d2 = new Date(v.fecha_hasta).getTime();
      if (!Number.isNaN(d1) && !Number.isNaN(d2) && d1 > d2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fecha_hasta"], message: "Debe ser igual o posterior a la fecha desde" });
      }
    }
  });

/* ===============================
 * Módulo: REPARACIÓN (objeto con validación condicional)
 * =============================== */
export const reparacionSchema = z
  .object({
    modulo: z.literal("reparacion"),
    tipo_reparacion: z.enum(["maquinaria","otros"]),
    unidad_reparar: z.string().optional(),
    que_reparar: z.string().optional(),
    detalle_reparacion: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipo_reparacion === "maquinaria") {
      if (!v.unidad_reparar || v.unidad_reparar.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unidad_reparar"], message: "Seleccione una unidad" });
      }
      if (!v.detalle_reparacion || v.detalle_reparacion.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["detalle_reparacion"], message: "Describa la reparación" });
      }
    } else {
      if (!v.que_reparar || v.que_reparar.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["que_reparar"], message: "Indique qué desea reparar" });
      }
      if (!v.detalle_reparacion || v.detalle_reparacion.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["detalle_reparacion"], message: "Describa la reparación" });
      }
    }
  });

/* ===============================
 * Módulo: OBRAS
 * =============================== */
export const obrasSchema = z
  .object({
    modulo: z.literal("obras"),
    proveedor: nonEmpty("Proveedor"),
    obra_nombre: nonEmpty("Nombre de la obra"),
    fecha_inicio: dateStr("Fecha inicio"),
    fecha_fin:    dateStr("Fecha fin"),
    monto_contrato: z.coerce.number().positive("Monto inválido"),
    anticipo_pct: z.coerce.number().min(0).max(100).optional(),
  })
  .superRefine((v, ctx) => {
    const d1 = new Date(v.fecha_inicio).getTime();
    const d2 = new Date(v.fecha_fin).getTime();
    if (!Number.isNaN(d1) && !Number.isNaN(d2) && d1 > d2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fecha_fin"], message: "Debe ser igual o posterior a la fecha inicio" });
    }
  });

/* ===============================
 * Módulo: MANTENIMIENTO DE ESCUELAS
 * =============================== */
export const mantenimientodeescuelasSchema = z.object({
  modulo: z.literal("mantenimientodeescuelas"),
  escuela: nonEmpty("Escuela"),
  proveedor: nonEmpty("Proveedor"),
  descripcion: z.string().min(3, "Descripción muy corta"),
  fecha: dateStr("Fecha"),
  costo_estimado: z.coerce.number().positive("Monto inválido"),
});

/* ===============================
 * Unión discriminada por "modulo" + tipos
 * =============================== */
export const createPedidoSchema = z.discriminatedUnion("modulo", [
  generalSchema.merge(baseSchema),
  serviciosSchema.merge(baseSchema),
  alquilerSchema.merge(baseSchema),
  adquisicionSchema.merge(baseSchema),
  serviciosextensionSchema.merge(baseSchema),
  reparacionSchema.merge(baseSchema),
  obrasSchema.merge(baseSchema),
  mantenimientodeescuelasSchema.merge(baseSchema),
]);

export type CreatePedidoInput = z.infer<typeof createPedidoSchema>;

export type Modulo =
  | "general"
  | "servicios"
  | "alquiler"
  | "adquisicion"
  | "serviciosextension"
  | "reparacion"
  | "obras"
  | "mantenimientodeescuelas";
