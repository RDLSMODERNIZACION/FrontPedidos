// src/app/pedidos/page.tsx
'use client';

import { useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import { SECRETARIAS, PEDIDOS, HISTORIAL, ARCHIVOS } from "@/lib/data";
import { Pedido } from "@/lib/types";
import PedidosTable from "@/components/PedidosTable";
import Drawer from "@/components/Drawer";
import Badge from "@/components/Badge";
import { cap, fmtMoney, fmtDate } from "@/lib/utils";

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [filtros, setFiltros] = useState({ secretaria: "", estado: "", q: "" });

  const filtered = useMemo(() => {
    let rows = PEDIDOS.slice();
    if (filtros.secretaria) rows = rows.filter(r => r.secretaria === filtros.secretaria);
    if (filtros.estado) rows = rows.filter(r => r.estado === filtros.estado);
    if (filtros.q) rows = rows.filter(r =>
      (r.id_tramite + r.modulo + r.secretaria + r.solicitante)
        .toLowerCase()
        .includes(filtros.q.toLowerCase())
    );
    return rows;
  }, [filtros]);

  const kpis = {
    total: filtered.length,
    enRev: filtered.filter(r => r.estado === "en_revision").length,
    aprob: filtered.filter(r => r.estado === "aprobado").length,
    rech: filtered.filter(r => r.estado === "rechazado").length,
  };

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total" value={kpis.total} />
        <KpiCard label="En revisión" value={kpis.enRev} />
        <KpiCard label="Aprobados" value={kpis.aprob} />
        <KpiCard label="Rechazados" value={kpis.rech} />
      </section>

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
              className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[180px]"
              value={filtros.estado}
              onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="borrador">Borrador</option>
              <option value="enviado">Enviado</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="reenviado">Reenviado</option>
              <option value="cerrado">Cerrado</option>
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
            <button className="btn-ghost" onClick={() => setFiltros({ secretaria: "", estado: "", q: "" })}>
              Limpiar
            </button>
            <button
              className="btn"
              onClick={() => {
                const rows = filtered;
                const headers = ["id_tramite", "modulo", "secretaria", "solicitante", "estado", "total", "creado_en"];
                const csv = [headers.join(",")]
                  .concat(rows.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? "")).join(",")))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "pedidos_demo.csv";
                a.click();
              }}
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <PedidosTable
          rows={filtered}
          onOpen={(row) => { setSelected(row); setDrawerOpen(true); }}
        />
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? `${selected.id_tramite} · ${cap(selected.modulo)}` : "Detalle"}
      >
        {selected ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={selected.estado === "aprobado" || selected.estado === "cerrado" ? "ok" : selected.estado === "rechazado" ? "bad" : "warn"}>
                {cap(selected.estado)}
              </Badge>
              <Badge>{selected.solicitante}</Badge>
              <Badge>{selected.secretaria}</Badge>
            </div>

            <div className="card">
              <h4 className="text-base font-semibold mb-2">Información</h4>
              <div><strong>Módulo:</strong> {cap(selected.modulo)}</div>
              <div><strong>Solicitante:</strong> {selected.solicitante}</div>
              <div><strong>Creado:</strong> {fmtDate(selected.creado_en)}</div>
              <div><strong>Total:</strong> {fmtMoney(selected.total)}</div>
            </div>

            <div className="card">
              <h4 className="text-base font-semibold mb-2">Historial</h4>
              <div className="grid gap-2 border-l-2 border-[#23304a] pl-3">
                {(HISTORIAL[selected.id] || []).map((h, i) => (
                  <div key={i} className="grid gap-0.5">
                    <strong className="text-sm">{cap(h.accion)}</strong>
                    <small className="text-[#9aa3b2]">{fmtDate(h.ts)} · {cap(h.estado)}</small>
                  </div>
                ))}
                {!(HISTORIAL[selected.id] || []).length && <small className="text-[#9aa3b2]">Sin movimientos</small>}
              </div>
            </div>

            <div className="card">
              <h4 className="text-base font-semibold mb-2">Archivos</h4>
              <ul className="list-disc pl-5">
                {(ARCHIVOS[selected.id] || []).map((f, i) => (
                  <li key={i}>
                    {f.nombre} <small className="text-[#9aa3b2]">({f.mime}, {f.bytes.toLocaleString()} bytes)</small>
                  </li>
                ))}
                {!(ARCHIVOS[selected.id] || []).length && <li><small className="text-[#9aa3b2]">No hay archivos</small></li>}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
