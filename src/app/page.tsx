// src/app/page.tsx
'use client';

import React, { useMemo } from "react";
import Timeline, { type TimelineStage } from "@/components/Timeline";
import QuickActions from "@/components/QuickActions";

export default function Page() {
  // Etapas del ejemplo (mock). Se pueden reemplazar luego por datos reales.
  const stages: TimelineStage[] = useMemo(() => [
    {
      key: "creacion",
      title: "Creación",
      subtitle: "Exp: EXP-2025-0008 · Área: Compras",
      date: "12/10",
      whoNow: "Solicitante",
      whatNext: "Enviar a revisión",
    },
    {
      key: "revision",
      title: "Revisión",
      subtitle: "Control de forma y fondo",
      date: "13/10",
      whoNow: "Mesa de Entradas",
      whatNext: "Derivar a firmas",
    },
    {
      key: "firmas",
      title: "Firma(s)",
      subtitle: "Sec. de Economía · Sec. de Gobierno",
      date: "14/10",
      whoNow: "Secretarías",
      whatNext: "Generar orden de compra",
    },
    {
      key: "orden",
      title: "Orden de compra",
      subtitle: "OC-1542 emitida",
      date: "16/10",
      whoNow: "Compras",
      whatNext: "Ejecución y cierre",
    },
    {
      key: "cierre",
      title: "Cierre",
      subtitle: "Expediente finalizado",
      date: "18/10",
      whoNow: "Archivo",
      whatNext: null,
    },
  ], []);

  // Acciones rápidas. Dejé rutas existentes y placeholders en las que
  // todavía no están implementadas (evita 404).
  const actions = useMemo(() => [
    { title: "Nuevo Pedido",       description: "Iniciá un expediente desde una plantilla", href: "/pedidos/nuevo", cta: "Crear" },
    { title: "Mis Expedientes",    description: "Seguimiento y estados en tiempo real",     href: "/pedidos",        cta: "Ver"   },
    { title: "Cargar Presupuesto", description: "Adjuntá propuestas y pliegos",             href: "#",               cta: "Cargar"},
    { title: "Ver Estados",        description: "Filtro por área/fecha/tipo",               href: "/pedidos",        cta: "Explorar"},
    { title: "Proveedores",        description: "Consulta y adjuntos vigentes",             href: "#",               cta: "Abrir" },
    { title: "Reportes",           description: "Descargas y dashboard",                    href: "#",               cta: "Ver"   },
  ], []);

  return (
    <div className="grid gap-6">
      <Timeline
        title="Así avanza un expediente típico"
        playing
        stages={stages}
      />

      <QuickActions actions={actions} />
    </div>
  );
}
