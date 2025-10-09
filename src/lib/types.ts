export type Estado =
  | "borrador" | "enviado" | "en_revision" | "aprobado" | "rechazado" | "reenviado" | "cerrado";

export type Modulo =
  | "adquisicion" | "alquiler" | "servicios" | "serviciosextension"
  | "reparacion" | "obras" | "general" | "mantenimientodeescuelas";

export type Pedido = {
  id: string;
  id_tramite: string;
  modulo: Modulo;
  secretaria: string;
  solicitante: string;
  estado: Estado;
  total: number;
  creado_en: string;
};
