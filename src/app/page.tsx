// src/app/page.tsx
'use client';

import React, { useMemo } from "react";
import Timeline, { type TimelineStage } from "@/components/Timeline";
import QuickActions from "@/components/QuickActions";

export default function Page() {
  const short = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

  const stages: TimelineStage[] = useMemo(() => {
    const d0 = new Date();
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);
    const d2 = new Date(d0); d2.setDate(d2.getDate() + 2);
    const d3 = new Date(d0); d3.setDate(d3.getDate() + 3);
    const d4 = new Date(d0); d4.setDate(d4.getDate() + 4);

    return [
      // 1) Enviado
      {
        key: "enviado",
        title: "Enviado",
        subtitle: "Exp: EXP-2025-0008 · Área: Compras",
        date: short(d0),
        whoNow: "Solicitante",
        whatNext: "Pasa a Aprobado",
      },
      // 2) Aprobado (antes “Firmas”)
      {
        key: "Estado",
        title: "Estado",
        subtitle: "Analizando fondos disponibles",
        date: short(d1),
        whoNow: "Secretaría",
        whatNext: "Preparación de expediente",
      },
      // 3) Expediente en proceso
      {
        key: "expediente_en_proceso",
        title: "Expediente en proceso",
        subtitle: "Se encuentra en preparación",
        date: short(d2),
        whoNow: "Compras",
        whatNext: "Área de pago",
      },
      // 4) Área de pago (nuevo)
      {
        key: "area_de_pago",
        title: "Área de pago",
        subtitle: "Se encuentra para saldar",
        date: short(d3),
        whoNow: "Tesorería",
        whatNext: "Cierre",
      },
      // 5) Cierre (final)
      {
        key: "cierre",
        title: "Cierre",
        subtitle: "Expediente finalizado",
        date: short(d4),
        whoNow: "Archivo",
        whatNext: null,
      },
    ];
  }, []);

  const actions = useMemo(
    () => [
      { title: "Nuevo Pedido",       description: "Iniciá un expediente desde una plantilla", href: "/pedidos/nuevo", cta: "Crear" },
      { title: "Mis Expedientes",    description: "Seguimiento y estados en tiempo real",     href: "/pedidos",        cta: "Ver"   },
      { title: "Cargar Presupuesto", description: "Adjuntá propuestas y pliegos",             href: "#",               cta: "Cargar"},
      { title: "Ver Estados",        description: "Filtro por área/fecha/tipo",               href: "/pedidos",        cta: "Explorar"},
      { title: "Proveedores",        description: "Consulta y adjuntos vigentes",             href: "#",               cta: "Abrir" },
      { title: "Reportes",           description: "Descargas y dashboard",                    href: "#",               cta: "Ver"   },
    ],
    []
  );

  return (
    <div className="grid gap-6">
      <Timeline title="Así avanza un expediente típico" playing stages={stages} />
      <QuickActions actions={actions} />
    </div>
  );
}
