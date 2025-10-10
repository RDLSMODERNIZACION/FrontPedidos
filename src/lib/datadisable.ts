// src/lib/datadisable.ts
// Catálogos “hardcoded” mientras no haya endpoint real.

export const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
] as const;

export type SecretariaNombre = (typeof SECRETARIAS)[number];

// Dejar espacio para más catálogos si los necesitás:
// export const AMBITOS = [...];
// export type AmbitoNombre = (typeof AMBITOS)[number];
