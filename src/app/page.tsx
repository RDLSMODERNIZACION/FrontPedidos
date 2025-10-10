"use client";

// src/app/page.tsx
import Timeline, { TimelineStage } from "@/components/Timeline";
import QuickActions from "@/components/QuickActions";

import PendingInbox from "@/components/PendingInbox";
import DueSemaforo from "@/components/DueSemaforo";
import TodayFeed from "@/components/TodayFeed";
import RoleShortcuts from "@/components/RoleShortcuts";

import StageHeatmap from "@/components/StageHeatmap";
import SLAProgress from "@/components/SLAProgress";
import TopBlockers from "@/components/TopBlockers";

import BudgetVsCredit from "@/components/BudgetVsCredit";
import SavingsCard from "@/components/SavingsCard";
import Funnel from "@/components/Funnel";
import SupplierScore from "@/components/SupplierScore";
import KYCAlerts from "@/components/KYCAlerts";
import SpendConcentration from "@/components/SpendConcentration";

import { useMemo } from "react";

export default function Page() {
  // Datos mock para timeline y tarjetas; luego se conectan al backend
  const stages: TimelineStage[] = useMemo(() => [
    { key: "creacion", title: "Creación", subtitle: "Exp: EXP-2025-0008 · Área: Compras", date: "12/10", whoNow: "Solicitante", whatNext: "Enviar a revisión" },
    { key: "revision", title: "Revisión", subtitle: "Control de forma y fondo", date: "13/10", whoNow: "Mesa de Entradas", whatNext: "Derivar a firmas" },
    { key: "firmas", title: "Firma(s)", subtitle: "Sec. de Economía · Sec. de Gobierno", date: "14/10", whoNow: "Secretarías", whatNext: "Generar orden de compra" },
    { key: "orden", title: "Orden de compra", subtitle: "OC-1542 emitida", date: "16/10", whoNow: "Compras", whatNext: "Ejecución y cierre" },
    { key: "cierre", title: "Cierre", subtitle: "Expediente finalizado", date: "18/10", whoNow: "Archivo", whatNext: null },
  ], []);

  return (
    <div className="grid gap-6 md:gap-8">
      {/* Presentación */}
      <Timeline stages={stages} autoplay cycleMs={5000} />
      <QuickActions
        actions={[
          { title: "Nuevo Pedido", description: "Iniciá un expediente desde una plantilla", href: "/pedidos/nuevo", cta: "Crear" },
          { title: "Mis Expedientes", description: "Seguimiento y estados en tiempo real", href: "/pedidos", cta: "Ver" },
          { title: "Cargar Presupuesto", description: "Adjuntá propuestas y pliegos", href: "/pedidos/cargar", cta: "Cargar" },
          { title: "Ver Estados", description: "Filtro por área/fecha/tipo", href: "/pedidos?tab=estados", cta: "Explorar" },
          { title: "Proveedores", description: "Consulta y adjuntos vigentes", href: "/proveedores", cta: "Abrir" },
          { title: "Reportes", description: "Descargas y dashboard", href: "/reportes", cta: "Ver" },
        ]}
      />

      {/* 1) Operativa & qué hago ahora */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <PendingInbox />
          <DueSemaforo />
          <TodayFeed />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <RoleShortcuts role="compras" />
        </div>
      </section>

      {/* 2) Flujo y cuellos de botella */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <StageHeatmap />
          <SLAProgress />
        </div>
        <TopBlockers />
      </section>

      {/* 3) Presupuesto & ahorro */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4">
          <BudgetVsCredit />
          <SavingsCard />
        </div>
        <div className="lg:col-span-2">
          <Funnel />
        </div>
      </section>

      {/* 4) Proveedores & calidad */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <SupplierScore />
          <KYCAlerts />
        </div>
        <SpendConcentration />
      </section>
    </div>
  );
}
