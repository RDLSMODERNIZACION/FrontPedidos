// src/app/pedidos/nuevo/constants.ts
export const PREVIEW_MODE = false; // conectado al backend
export const DELAY_MS = 10_000;    // 10 segundos exactos

export type ModNormal = "servicios" | "alquiler" | "adquisicion" | "reparacion";
export const MODULOS_NORMALES: Array<{ id: ModNormal; title: string; hint: string }> = [
  { id: "servicios",   title: "Servicios",   hint: "Mantenimiento o Profesionales" },
  { id: "alquiler",    title: "Alquiler",    hint: "Edificio / Maquinaria / Otros" },
  { id: "adquisicion", title: "Adquisición", hint: "Ítems a comprar (uno o muchos)" },
  { id: "reparacion",  title: "Reparación",  hint: "Maquinaria u otros" },
];

export type Ambito = "ninguno" | "mantenimientodeescuelas" | "obra";
export const AMBITOS: Array<{ id: Ambito; title: string; hint: string }> = [
  { id: "mantenimientodeescuelas", title: "Mantenimiento de Escuelas", hint: "Pide 'Escuela'" },
  { id: "obra",                    title: "Obra",                      hint: "Nombre + Anexo 1 (PDF)" },
  { id: "ninguno",                 title: "Ninguno",                   hint: "Sin ambiente especial" },
];

export const AMBITO_INTRO: Record<Ambito, { intro: string; bullets?: string[] }> = {
  mantenimientodeescuelas: { intro: "Ambiente de Mantenimiento de Escuelas.", bullets: ["Escuela (dato único para pruebas)"] },
  obra: { intro: "Ambiente de Obra.", bullets: ["Nombre de la obra", "Anexo 1 (PDF) obligatorio"] },
  ninguno: { intro: "Sin ambiente especial. Podés continuar.", bullets: [] },
};

export type ModStage = "intro" | "choose" | "form";
export type Step = 1 | 2 | 3 | 4 | 5;
