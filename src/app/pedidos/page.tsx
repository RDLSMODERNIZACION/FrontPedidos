// src/app/pedidos/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import PedidosTable from "@/components/PedidosTable";
import Drawer from "@/components/Drawer";
import { cap } from "@/lib/utils";
import { getPedidos, type BackendPedido } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { canView, isEconomiaAdmin, isAreaCompras, isSecretariaCompras } from "@/lib/roles";
import PedidoDetalleDrawer from "./PedidoDetalleDrawer";

const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
];

type TabKey = "info" | "archivos" | "estado" | "admin";

export default function Page() {
  const { isAuthenticated, token, user } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<BackendPedido | null>(null);
  const [filtros, setFiltros] = useState({ secretaria: "", estado: "", q: "" });

  // Prefijar secretaría SOLO para usuarios "comunes".
  useEffect(() => {
    const u = user;
    const esAmplio = isEconomiaAdmin(u) || isAreaCompras(u) || isSecretariaCompras(u);
    if (!esAmplio && u?.secretaria && !filtros.secretaria) {
      setFiltros(f => ({ ...f, secretaria: u.secretaria! }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.secretaria]);

  // Data real desde backend
  const [items, setItems] = useState<BackendPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Cargar listado
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErr(null);
    getPedidos(
      {
        limit: 200,
        offset: 0,
        q: filtros.q || undefined,
        estado: filtros.estado || undefined,
        sort: "updated_at_desc",
      },
      token
    )
      .then((r) => setItems(r.items ?? []))
      .catch((e) => setErr(e?.message || "Error"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, filtros.q, filtros.estado]);

  // Filtro UI + permisos
  const filtered = useMemo(() => {
    let rows = Array.isArray(items) ? [...items] : [];
    if (filtros.secretaria) rows = rows.filter(r => r.secretaria === filtros.secretaria);
    if (filtros.estado) rows = rows.filter(r => r.estado === filtros.estado);
    if (filtros.q) {
      const q = filtros.q.toLowerCase();
      rows = rows.filter(r => {
        const s = (r.id_tramite ?? `#${r.id}`)
          + (r.modulo ?? r.tipo_ambito ?? "")
          + (r.secretaria ?? "")
          + (r.solicitante ?? "");
        return s.toLowerCase().includes(q);
      });
    }
    rows = rows.filter(r => canView(user, r));
    return rows;
  }, [items, filtros, user]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    enRev: filtered.filter(r => r.estado === "en_revision").length,
    aprob: filtered.filter(r => r.estado === "aprobado").length,
    rech:  filtered.filter(r => r.estado === "rechazado").length,
  }), [filtered]);

  return (
    <RequireAuth>
      <div className="grid gap-4">
        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total" value={kpis.total} />
          <KpiCard label="En revisión" value={kpis.enRev} />
          <KpiCard label="Aprobados" value={kpis.aprob} />
          <KpiCard label="Rechazados" value={kpis.rech} />
        </section>

        {/* Filtros */}
        <section className="card">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-[#9aa3b2]">
              <span>Secretaría</span>
              <select
                className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[220px]"
                value={filtros.secretaria}
                onChange={e => setFiltros(f => ({ ...f, secretaria: e.target.value }))}
              >
                <option value="">Todas</option>
                {SECRETARIAS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-[#9aa3b2]">
              <span>Estado</span>
              <select
                className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[200px]"
                value={filtros.estado}
                onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="borrador">borrador</option>
                <option value="enviado">enviado</option>
                <option value="en_revision">en_revision</option>
                <option value="aprobado">aprobado</option>
                <option value="rechazado">rechazado</option>
                <option value="en_proceso">en_proceso</option>
                <option value="area_pago">area_pago</option>
                <option value="cerrado">cerrado</option>
              </select>
            </label>

            <label className="grid gap-1 text-[#9aa3b2] flex-1">
              <span>Buscar</span>
              <input
                className="w-full bg-panel2 border border-[#27314a] rounded-xl px-3 py-2"
                placeholder="ID trámite, solicitante, módulo..."
                value={filtros.q}
                onChange={e => setFiltros(f => ({ ...f, q: e.target.value }))}
              />
            </label>

            <div className="ml-auto flex gap-2">
              {user?.secretaria && (
                <button
                  className="btn-ghost"
                  onClick={() => setFiltros(f => ({ ...f, secretaria: user.secretaria! }))}
                  title="Usar mi secretaría"
                >
                  Mi secretaría
                </button>
              )}
              <button className="btn-ghost" onClick={() => setFiltros({ secretaria: "", estado: "", q: "" })}>
                Limpiar
              </button>
              <button
                className="btn"
                onClick={() => {
                  const rows = filtered;
                  const headers = ["id_tramite","modulo","secretaria","solicitante","estado","total","creado"];
                  const csv = [headers.join(",")]
                    .concat(rows.map((r: any) => headers.map(h => JSON.stringify(
                      h === "modulo" ? (r.modulo ?? r.tipo_ambito ?? "") : r[h] ?? ""
                    )).join(",")))
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "pedidos.csv";
                  a.click();
                }}
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </section>

        {/* Tabla */}
        <section className="card">
          {loading && <div className="text-[#9aa3b2]">Cargando…</div>}
          {err && <div className="text-red-400">Error: {err}</div>}
          {!loading && !err && (
            <PedidosTable
              rows={filtered}
              onOpen={(row) => { setSelected(row); setDrawerOpen(true); }}
            />
          )}
        </section>

        {/* Drawer (detalle al costado) */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={selected ? `${selected.id_tramite ?? `#${selected.id}`} · ${cap((selected.modulo ?? selected.tipo_ambito ?? "—").toString())}` : "Detalle"}
        >
          {selected ? (
            <PedidoDetalleDrawer
              pedido={selected}
              token={token}
              user={user}
              onUpdateEstado={(id, estado) => {
                setSelected(s => (s && s.id === id ? { ...s, estado } : s));
                setItems(arr => arr.map(r => (r.id === id ? { ...r, estado } : r)));
              }}
            />
          ) : null}
        </Drawer>
      </div>
    </RequireAuth>
  );
}
