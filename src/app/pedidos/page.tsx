// src/app/pedidos/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import PedidosTable from "@/components/PedidosTable";
import Drawer from "@/components/Drawer";
import Badge from "@/components/Badge";
import { cap, fmtMoney, fmtDate } from "@/lib/utils";
import { getPedidos, type BackendPedido } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

// 👇 permisos y acciones
import ApprovalActions from "@/components/ApprovalActions";
import { canView, canModerate, isEconomiaAdmin, isAreaCompras, isSecretariaCompras } from "@/lib/roles";
import { setEstadoPedido } from "@/lib/pedidosActions";

// 👇 archivos (uploader + helper para detectar formal_pdf)
import ArchivoFormalUploader from "@/components/pedidos/ArchivoFormalUploader";
import { listPedidoArchivos, type PedidoArchivo } from "@/lib/pedidos";

const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
];

export default function Page() {
  const { auth } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<BackendPedido | null>(null);
  const [filtros, setFiltros] = useState({ secretaria: "", estado: "", q: "" });

  // Prefijar secretaría SOLO para usuarios "comunes".
  useEffect(() => {
    const u = auth?.user;
    const esAmplio = isEconomiaAdmin(u) || isAreaCompras(u) || isSecretariaCompras(u);
    if (!esAmplio && u?.secretaria && !filtros.secretaria) {
      setFiltros(f => ({ ...f, secretaria: u.secretaria! }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  // Data real desde backend
  const [items, setItems] = useState<BackendPedido[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPedidos({
      limit: 200,
      offset: 0,
      q: filtros.q || undefined,
      estado: filtros.estado || undefined,
      sort: "updated_at_desc",
    })
      .then((r) => {
        setItems(r.items ?? []);
        setCount(r.count ?? 0);
        setErr(null);
      })
      .catch((e) => setErr(e.message || "Error"))
      .finally(() => setLoading(false));
  }, [filtros.q, filtros.estado]);

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
          + r.secretaria
          + (r.solicitante ?? "");
        return s.toLowerCase().includes(q);
      });
    }
    rows = rows.filter(r => canView(auth?.user, r));
    return rows;
  }, [items, filtros, auth]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    enRev: filtered.filter(r => r.estado === "en_revision").length,
    aprob: filtered.filter(r => r.estado === "aprobado").length,
    rech:  filtered.filter(r => r.estado === "rechazado").length,
  }), [filtered]);

  const [actionBusy, setActionBusy] = useState(false);

  // flag: falta secretaria en sesión
  const faltaSecretariaHdr = !auth?.user?.secretaria;

  // ---------- Archivos: detectar si ya existe formal_pdf para el seleccionado ----------
  const [hasFormal, setHasFormal] = useState<boolean>(false);
  const [loadingArchivos, setLoadingArchivos] = useState<boolean>(false);

  async function refreshArchivosForSelected(p: BackendPedido | null) {
    if (!p) { setHasFormal(false); return; }
    try {
      setLoadingArchivos(true);
      const archs: PedidoArchivo[] = await listPedidoArchivos(p.id);
      setHasFormal(archs.some(a => a.kind === "formal_pdf"));
    } catch {
      // si falla, no bloqueamos la UI
      setHasFormal(false);
    } finally {
      setLoadingArchivos(false);
    }
  }

  useEffect(() => {
    void refreshArchivosForSelected(selected);
  }, [selected?.id]);

  return (
    <RequireAuth>
      <div className="grid gap-4">
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
                className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[180px]"
                value={filtros.estado}
                onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="borrador">borrador</option>
                <option value="enviado">enviado</option>
                <option value="en_revision">en_revision</option>
                <option value="aprobado">aprobado</option>
                <option value="rechazado">rechazado</option>
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
              {auth?.user?.secretaria && (
                <button
                  className="btn-ghost"
                  onClick={() => setFiltros(f => ({ ...f, secretaria: auth.user.secretaria! }))}
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

        {/* Drawer (detalle) */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={selected ? `${selected.id_tramite ?? `#${selected.id}`} · ${cap((selected.modulo ?? selected.tipo_ambito ?? "—").toString())}` : "Detalle"}
        >
          {selected ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={selected.estado === "aprobado" || selected.estado === "cerrado" ? "ok" : selected.estado === "rechazado" ? "bad" : "warn"}>
                  {cap(selected.estado)}
                </Badge>
                <Badge>{selected.solicitante ?? "—"}</Badge>
                <Badge>{selected.secretaria}</Badge>
                {/* Indicador si ya hay PDF formal */}
                {loadingArchivos ? (
                  <Badge>Archivos…</Badge>
                ) : hasFormal ? (
                  <Badge tone="ok">PDF firmado</Badge>
                ) : null}
              </div>

              {/* Aviso si falta definir secretaría en la sesión */}
              {faltaSecretariaHdr && (
                <div className="text-yellow-400 text-sm">
                  Para aprobar o marcar en revisión necesitás tener una <b>Secretaría</b> asociada a tu usuario (X-Secretaria).
                </div>
              )}

              <ApprovalActions
                canAct={!faltaSecretariaHdr && canModerate(auth?.user, selected)}
                loading={actionBusy}
                onApprove={async () => {
                  if (!selected) return;
                  try {
                    setActionBusy(true);
                    await setEstadoPedido(selected.id, "aprobado", {
                      token: auth?.token,
                      user: auth?.user?.username,
                      secretaria: auth?.user?.secretaria ?? undefined,
                    });
                    setSelected(s => (s ? { ...s, estado: "aprobado" } : s));
                    setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "aprobado" } : r));
                    // al aprobar, refrescamos archivos para habilitar el uploader
                    await refreshArchivosForSelected({ ...selected, estado: "aprobado" } as BackendPedido);
                  } finally {
                    setActionBusy(false);
                  }
                }}
                onReview={async () => {
                  if (!selected) return;
                  try {
                    setActionBusy(true);
                    await setEstadoPedido(selected.id, "en_revision", {
                      token: auth?.token,
                      user: auth?.user?.username,
                      secretaria: auth?.user?.secretaria ?? undefined,
                    });
                    setSelected(s => (s ? { ...s, estado: "en_revision" } : s));
                    setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "en_revision" } : r));
                    // si vuelve a revisión, no borramos el flag (puede existir formal ya cargado)
                  } finally {
                    setActionBusy(false);
                  }
                }}
              />

              <div className="card">
                <h4 className="text-base font-semibold mb-2">Información</h4>
                <div><strong>Módulo:</strong> {cap((selected.modulo ?? selected.tipo_ambito ?? "—").toString())}</div>
                <div><strong>Solicitante:</strong> {selected.solicitante ?? "—"}</div>
                <div><strong>Creado:</strong> {fmtDate(selected.creado)}</div>
                <div><strong>Total:</strong> {fmtMoney(selected.total)}</div>
              </div>

              <div className="card">
                <h4 className="text-base font-semibold mb-1">Historial</h4>
                <small className="text-[#9aa3b2]">Sin movimientos (endpoint de detalle pendiente).</small>
              </div>

              <div className="card">
                <h4 className="text-base font-semibold mb-2">Archivos</h4>
                <ArchivoFormalUploader
                  pedidoId={selected.id}
                  estado={selected.estado}
                  onUploaded={() => setHasFormal(true)}  // al subir, marcamos que ya hay PDF
                />
              </div>
            </div>
          ) : null}
        </Drawer>
      </div>
    </RequireAuth>
  );
}
