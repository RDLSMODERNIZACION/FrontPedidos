import { Pedido, HistItem, Archivo } from "./types";

export const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
];

export const PEDIDOS: Pedido[] = [
  { id: "0d2d", id_tramite: "EXP-2025-0001", modulo: "adquisicion", secretaria: SECRETARIAS[0], solicitante: "María Gómez", estado: "en_revision", total: 248500.50, creado_en: "2025-09-28T10:22:00Z" },
  { id: "c9af", id_tramite: "EXP-2025-0002", modulo: "servicios", secretaria: SECRETARIAS[2], solicitante: "Lucas Peralta", estado: "aprobado", total: 98500.00, creado_en: "2025-09-29T15:10:00Z" },
  { id: "7a31", id_tramite: "EXP-2025-0003", modulo: "alquiler", secretaria: SECRETARIAS[1], solicitante: "Erica Duarte", estado: "rechazado", total: 150000.00, creado_en: "2025-10-01T12:06:00Z" },
  { id: "338b", id_tramite: "EXP-2025-0004", modulo: "obras", secretaria: SECRETARIAS[3], solicitante: "Pablo Vera", estado: "enviado", total: 730000.00, creado_en: "2025-10-02T09:41:00Z" },
  { id: "a1c0", id_tramite: "EXP-2025-0005", modulo: "reparacion", secretaria: SECRETARIAS[3], solicitante: "Carla Ruiz", estado: "en_revision", total: 67400.00, creado_en: "2025-10-02T16:20:00Z" },
  { id: "51de", id_tramite: "EXP-2025-0006", modulo: "general", secretaria: SECRETARIAS[0], solicitante: "Hernán Ponce", estado: "aprobado", total: 23300.00, creado_en: "2025-10-03T08:50:00Z" },
  { id: "d2b3", id_tramite: "EXP-2025-0007", modulo: "serviciosextension", secretaria: SECRETARIAS[2], solicitante: "Ana Torres", estado: "borrador", total: 12000.00, creado_en: "2025-10-03T11:32:00Z" },
  { id: "8f42", id_tramite: "EXP-2025-0008", modulo: "mantenimientodeescuelas", secretaria: SECRETARIAS[1], solicitante: "Carlos López", estado: "cerrado", total: 420000.00, creado_en: "2025-10-04T13:05:00Z" },
];

export const HISTORIAL: Record<string, HistItem[]> = {
  "0d2d": [
    { ts: "2025-09-28T10:22:00Z", accion: "crear", estado: "borrador" },
    { ts: "2025-09-28T12:11:00Z", accion: "enviar", estado: "enviado" },
    { ts: "2025-09-30T09:03:00Z", accion: "asignar revisor", estado: "en_revision" },
  ],
  "7a31": [
    { ts: "2025-10-01T12:06:00Z", accion: "crear", estado: "borrador" },
    { ts: "2025-10-01T12:40:00Z", accion: "enviar", estado: "enviado" },
    { ts: "2025-10-01T17:10:00Z", accion: "rechazar", estado: "rechazado" },
  ],
  "338b": [
    { ts: "2025-10-02T09:41:00Z", accion: "crear", estado: "borrador" },
    { ts: "2025-10-02T10:02:00Z", accion: "enviar", estado: "enviado" },
  ],
};

export const ARCHIVOS: Record<string, Archivo[]> = {
  "0d2d": [
    { nombre: "pliego.pdf", bytes: 183210, mime: "application/pdf" },
    { nombre: "cotizacion.xlsx", bytes: 54210, mime: "application/vnd.ms-excel" },
  ]
};
