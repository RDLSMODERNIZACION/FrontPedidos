# Contrataciones · Next.js + TypeScript (Demo)

Proyecto Node **real** (Next.js 14 + TS + Tailwind), con **datos mockeados** y
rutas API de Next a modo de stub. Pensado para migrar luego al backend FastAPI.

## Requisitos
- Node 18+
- npm o pnpm

## Cómo correr
```powershell
npm install
npm run dev
# abrir http://localhost:5173
```

## Config
- Variables en `.env` (copiar desde `.env.example`)
  - `NEXT_PUBLIC_API_BASE`: si lo completás con tu FastAPI, la app puede consumir tu backend (cuando cambiemos el fetcher).
  - `USE_MOCKS=true`: utiliza las rutas `/api` locales con datos de ejemplo.

## Estructura
```
src/
  app/
    (App Router: layout, pages)
    api/                 # mocks
  components/            # UI reusables
  lib/                   # tipos, datos fake, utilidades
```

## Próximos pasos
- Reemplazar mocks por `fetch` a FastAPI.
- Agregar autenticación Google → JWT httpOnly.
- Formularios por módulo (RHF + Zod).
- Subida de archivos al backend.
- Tablas con paginación/orden/column filters (TanStack Table) si hace falta.
