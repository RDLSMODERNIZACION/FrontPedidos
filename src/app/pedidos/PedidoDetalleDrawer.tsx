// src/components/pedidos/PedidoDetalleDrawer.tsx
'use client';

import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/Badge";
import {
  type BackendPedido,
  type PedidoInfo,
  type PedidoEtapas,
  type PedidoArchivo,
  getPedidoInfo,
  getPedidoEtapas,
} from "@/lib/api";
import { listArchivos, reviewArchivo as reviewFile } from "@/lib/archivos";
import { cap } from "@/lib/utils";

import InfoTab from "./tabs/InfoTab";
import ArchivosTab from "./tabs/ArchivosTab";
import EstadoTab from "./tabs/EstadoTab";
import AdminTab from "./tabs/AdminTab";
import ProveedoresTab from "./tabs/ProveedoresTab"; // ✅ conectado a backend

export default function PedidoDetalleDrawer({
  pedido,
  token,
  user,
  onUpdateEstado,
}: {
  pedido: BackendPedido;
  token?: string | null;
  user?: any;
  onUpdateEstado?: (id: number, estado: string) => void;
}) {
  type TabKey = "info" | "archivos" | "estado" | "proveedores" | "admin";
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // ===== Helpers de visualización =====
  const fmtEstado = (estado?: string | null) =>
    estado && estado.trim() ? cap(estado.replace(/_/g, " ")) : "—";

  const estadoTone = (estado?: string | null): "ok" | "bad" | "warn" => {
    switch (estado) {
      case "aprobado":
      case "cerrado":
        return "ok";
      case "rechazado":
        return "bad";
      case "enviado":
      case "en_revision":
      case "observado":
      case "en_proceso":
      case "area_pago":
      default:
        return "warn";
    }
  };

  // ===== Detalle / Archivos / Etapas =====
  const [detalle, setDetalle] = useState<PedidoInfo | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleErr, setDetalleErr] = useState<string | null>(null);

  const [files, setFiles] = useState<PedidoArchivo[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const [etapas, setEtapas] = useState<PedidoEtapas | null>(null);

  const STAGES = [
    { key: "enviado_at",     label: "Enviado" },
    { key: "en_revision_at", label: "En revisión" },
    { key: "aprobado_at",    label: "Aprobado" },
    { key: "en_proceso_at",  label: "En proceso" },
    { key: "area_pago_at",   label: "Área de pago" },
    { key: "cerrado_at",     label: "Cerrado" },
  ] as const;

  // -------- fetchers --------
  async function fetchDetalle() {
    try {
      setDetalleLoading(true);
      setDetalleErr(null);
      const data = await getPedidoInfo(pedido.id, token || undefined);
      setDetalle(data);
    } catch (e: any) {
      setDetalle(null);
      setDetalleErr(e?.message ?? "Detalle no disponible");
    } finally {
      setDetalleLoading(false);
    }
  }

  async function fetchEtapas() {
    try {
      const et = await getPedidoEtapas(pedido.id, token || undefined);
      setEtapas(et);
    } catch {
      setEtapas(null);
    }
  }

  async function refreshArchivos() {
    try {
      setFilesLoading(true);
      const archs = await listArchivos(pedido.id, token || undefined);
      setFiles(archs);
    } finally {
      setFilesLoading(false);
    }
  }

  // Refetch agrupado (lo usamos post-acción de admin)
  const refreshAll = async (estadoNuevo?: string) => {
    await Promise.all([refreshArchivos(), fetchDetalle(), fetchEtapas()]);
    if (estadoNuevo) onUpdateEstado?.(pedido.id, estadoNuevo);
  };

  // Carga inicial
  useEffect(() => {
    void fetchDetalle();
    void refreshArchivos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido.id]);

  // Cuando abrís "Estado", traemos etapas
  useEffect(() => {
    if (activeTab === "estado") void fetchEtapas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pedido.id]);

  // -------- últimos archivos por tipo --------
  const byKind = (k: string) => files.filter(f => f.kind === k);

  const latestFormal = useMemo(() => {
    const arr = byKind("formal_pdf");
    return arr
      .slice()
      .sort((a, b) => {
        const ta = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
        const tb = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
        return tb - ta || b.id - a.id;
      })[0];
  }, [files]);

  const latestExp1 = useMemo(() => {
    const arr = byKind("expediente_1");
    return arr
      .slice()
      .sort((a, b) => {
        const ta = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
        const tb = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
        return tb - ta || b.id - a.id;
      })[0];
  }, [files]);

  const latestExp2 = useMemo(() => {
    const arr = byKind("expediente_2");
    return arr
      .slice()
      .sort((a, b) => {
        const ta = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
        const tb = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
        return tb - ta || b.id - a.id;
      })[0];
  }, [files]);

  // ===== acciones (admin) =====
  const [actionBusy, setActionBusy] = useState(false);
  const reviewer = user?.nombre ?? user?.username ?? user?.email ?? "ui";

  async function approveFormalPdf() {
    if (!latestFormal) {
      alert("No hay formal_pdf para aprobar.");
      return;
    }
    try {
      setActionBusy(true);
      await reviewFile(latestFormal.id, "aprobado", null, token || undefined, reviewer);
      await refreshAll("en_proceso");
      setActiveTab("estado");
    } catch (e: any) {
      alert(e?.message ?? "No se pudo aprobar el formal_pdf");
    } finally {
      setActionBusy(false);
    }
  }

  async function observeFormalPdf() {
    if (!latestFormal) {
      alert("No hay formal_pdf para observar.");
      return;
    }
    const notes = prompt("Observaciones para el formal_pdf:");
    try {
      setActionBusy(true);
      await reviewFile(latestFormal.id, "observado", notes ?? null, token || undefined, reviewer);
      await refreshArchivos();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo observar el formal_pdf");
    } finally {
      setActionBusy(false);
    }
  }

  async function approveExp1() {
    if (!latestExp1) {
      alert("No hay expediente_1 para aprobar.");
      return;
    }
    try {
      setActionBusy(true);
      await reviewFile(latestExp1.id, "aprobado", null, token || undefined, reviewer);
      await refreshAll("area_pago");
      setActiveTab("estado");
    } catch (e: any) {
      alert(e?.message ?? "No se pudo aprobar el expediente_1");
    } finally {
      setActionBusy(false);
    }
  }

  async function observeExp1() {
    if (!latestExp1) {
      alert("No hay expediente_1 para observar.");
      return;
    }
    const notes = prompt("Observaciones para expediente_1:");
    try {
      setActionBusy(true);
      await reviewFile(latestExp1.id, "observado", notes ?? null, token || undefined, reviewer);
      await refreshArchivos();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo observar el expediente_1");
    } finally {
      setActionBusy(false);
    }
  }

  async function approveExp2() {
    if (!latestExp2) {
      alert("No hay expediente_2 para aprobar.");
      return;
    }
    try {
      setActionBusy(true);
      await reviewFile(latestExp2.id, "aprobado", null, token || undefined, reviewer);
      await refreshAll("cerrado");
      setActiveTab("estado");
    } catch (e: any) {
      alert(e?.message ?? "No se pudo aprobar el expediente_2");
    } finally {
      setActionBusy(false);
    }
  }

  async function observeExp2() {
    if (!latestExp2) {
      alert("No hay expediente_2 para observar.");
      return;
    }
    const notes = prompt("Observaciones para expediente_2:");
    try {
      setActionBusy(true);
      await reviewFile(latestExp2.id, "observado", notes ?? null, token || undefined, reviewer);
      await refreshArchivos();
    } catch (e: any) {
      alert(e?.message ?? "No se pudo observar el expediente_2");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    // 👇 Contenedor principal con flex + min-h-0 para scroll correcto
    <div className="flex flex-col min-h-0 gap-3">
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={estadoTone(pedido.estado)}>{fmtEstado(pedido.estado)}</Badge>
        <Badge>{pedido.secretaria ?? "—"}</Badge>
        {files.find(a => a.kind === "formal_pdf") ? <Badge tone="ok">PDF formal</Badge> : null}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2b3550]">
        {(
          [
            { key: "info", label: "Info" },
            { key: "archivos", label: "Archivos" },
            { key: "estado", label: "Estado" },
            { key: "proveedores", label: "Proveedores" },
            { key: "admin", label: "Admin" },
          ] as { key: TabKey; label: string }[]
        ).map(t => (
          <button
            key={t.key}
            className={`px-3 py-2 text-sm rounded-t-xl ${
              activeTab === t.key
                ? "bg-[#141a2a] text-white border-x border-t border-[#2b3550]"
                : "text-[#9aa3b2] hover:text-white"
            }`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel visible: ocupa alto restante y maneja su propio scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "info" && (
          <InfoTab detalle={detalle} loading={detalleLoading} error={detalleErr} />
        )}

        {activeTab === "archivos" && (
          <ArchivosTab
            pedidoId={pedido.id}
            estado={pedido.estado ?? "en_revision"}
            files={files}
            loading={filesLoading || actionBusy}
            onRefresh={() => {
              void refreshArchivos();
              void fetchDetalle();
              void fetchEtapas();
            }}
            token={token}
          />
        )}

        {activeTab === "estado" && <EstadoTab etapas={etapas} stages={STAGES} />}

        {activeTab === "proveedores" && <ProveedoresTab pedidoId={pedido.id} />}

        {activeTab === "admin" && (
          <AdminTab
            pedido={pedido}
            user={user}
            loading={actionBusy}
            // Documentos
            onApproveFormal={approveFormalPdf}
            onObserveFormal={observeFormalPdf}
            canApproveFormal={!!latestFormal}
            onApproveExp1={approveExp1}
            onObserveExp1={observeExp1}
            canApproveExp1={!!latestExp1}
            onApproveExp2={approveExp2}
            onObserveExp2={observeExp2}
            canApproveExp2={!!latestExp2}
            // 👉 Refresca todo al aprobar/observar/rechazar el pedido
            onAfterDecision={async (nuevoEstado) => {
              await refreshAll(nuevoEstado);
              setActiveTab("estado"); // opcional: mostrar la línea de tiempo
            }}
          />
        )}
      </div>
    </div>
  );
}
