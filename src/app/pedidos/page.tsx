// src/app/pedidos/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import KpiCard from "@/components/KpiCard";
import PedidosTable from "@/components/PedidosTable";
import Drawer from "@/components/Drawer";
import Badge from "@/components/Badge";
import { cap, fmtMoney, fmtDate } from "@/lib/utils";
import { getPedidos, type BackendPedido, API_BASE, authHeaders } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

// 👇 permisos y acciones
import ApprovalActions from "@/components/ApprovalActions";
import { canView, canModerate, isEconomiaAdmin, isAreaCompras, isSecretariaCompras } from "@/lib/roles";
import { setEstadoPedido } from "@/lib/pedidosActions";

// 👇 archivos (uploader + helpers)
import ArchivoFormalUploader from "@/components/pedidos/ArchivoFormalUploader";
import {
  listPedidoArchivos,
  type PedidoArchivo,
  fileUrl,
  reviewArchivo,
  type ReviewDecision
} from "@/lib/pedidos";

const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
];

type TabKey = "info" | "archivos" | "estado" | "admin";

// Helper simple para filas clave/valor
function Row({label, value}:{label:string; value: React.ReactNode}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 text-sm">
      <div className="text-[#9aa3b2]">{label}</div>
      <div className="text-white">{value ?? "—"}</div>
    </div>
  );
}

// Badge compacta para estado de revisión de documentos
function ReviewBadge({ st }: { st?: string }) {
  const tone = st === "aprobado" ? "text-emerald-400" : st === "observado" ? "text-red-400" : "text-amber-300";
  return <span className={`text-xs ${tone}`}>{st ?? "pendiente"}</span>;
}

export default function Page() {
  // ⬇️ del AuthProvider actual: { isAuthenticated, token, user, ... }
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
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Cargar listado cuando haya sesión lista o cambien filtros (sin SSR)
  useEffect(() => {
    if (!isAuthenticated) return; // evita 401 si todavía no hay token
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
      token // ⬅️ opcional: si lo pasás, tiene prioridad; si no, se lee de localStorage
    )
      .then((r) => {
        setItems(r.items ?? []);
        setCount(r.count ?? 0);
      })
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

  const [actionBusy, setActionBusy] = useState(false);

  // flag: falta secretaria en sesión
  const faltaSecretariaHdr = !user?.secretaria;

  // ---------- Tabs ----------
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // ---------- Detalle (Info): traigo ambiente + módulo del endpoint UI ----------
  const [detalle, setDetalle] = useState<any | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleErr, setDetalleErr] = useState<string | null>(null);

  async function fetchDetalle(p: BackendPedido | null) {
    if (!p) { setDetalle(null); setDetalleErr(null); return; }
    try {
      setDetalleLoading(true);
      setDetalleErr(null);
      const res = await fetch(`${API_BASE}/ui/pedidos/${p.id}`, {
        headers: { ...authHeaders(token) },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text().catch(()=>"Detalle no disponible"));
      const data = await res.json();
      setDetalle(data);
    } catch (e:any) {
      setDetalle(null);
      setDetalleErr(e?.message ?? "Detalle no disponible");
    } finally {
      setDetalleLoading(false);
    }
  }

  useEffect(() => {
    // Sólo cargo el detalle cuando abro el Drawer (tab Info por default)
    if (drawerOpen && selected) void fetchDetalle(selected);
  }, [drawerOpen, selected?.id]);

  // ---------- Archivos: badge + listado por pestaña ----------
  const [hasFormal, setHasFormal] = useState<boolean>(false);
  const [hasExp1, setHasExp1] = useState<boolean>(false);
  const [hasExp2, setHasExp2] = useState<boolean>(false);
  const [loadingArchivos, setLoadingArchivos] = useState<boolean>(false);

  const [files, setFiles] = useState<PedidoArchivo[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesErr, setFilesErr] = useState<string | null>(null);

  // Consulta liviana para el chip y flags (PDF firmado / exp1 / exp2)
  async function checkArchivoFlags(p: BackendPedido | null) {
    if (!p) { setHasFormal(false); setHasExp1(false); setHasExp2(false); return; }
    try {
      setLoadingArchivos(true);
      const archs: PedidoArchivo[] = await listPedidoArchivos(p.id);
      setHasFormal(archs.some(a => a.kind === "formal_pdf"));
      setHasExp1(archs.some(a => a.kind === "expediente_1"));
      setHasExp2(archs.some(a => a.kind === "expediente_2"));
    } catch {
      setHasFormal(false); setHasExp1(false); setHasExp2(false);
    } finally {
      setLoadingArchivos(false);
    }
  }
  useEffect(() => { void checkArchivoFlags(selected); }, [selected?.id]);

  // Lista completa (para pestañas Archivos/Admin)
  async function refreshArchivosLista(p: BackendPedido | null) {
    if (!p) { setFiles([]); setFilesErr(null); return; }
    try {
      setFilesLoading(true);
      setFilesErr(null);
      const archs = await listPedidoArchivos(p.id);
      setFiles(archs);
      setHasFormal(archs.some(a => a.kind === "formal_pdf"));
      setHasExp1(archs.some(a => a.kind === "expediente_1"));
      setHasExp2(archs.some(a => a.kind === "expediente_2"));
    } catch (e:any) {
      setFilesErr(e?.message ?? "Error al listar archivos");
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }
  useEffect(() => {
    if ((activeTab === "archivos" || activeTab === "admin") && selected?.id) {
      void refreshArchivosLista(selected);
    }
  }, [activeTab, selected?.id]);

  // permisos / estados admin
  const isTerminal = selected?.estado === "aprobado" || selected?.estado === "rechazado" || selected?.estado === "cerrado";
  const canAct = !faltaSecretariaHdr && !!selected && canModerate(user, selected) && !isTerminal;

  // ------- Upload helpers (Expedientes) -------
  async function uploadTipoDoc(pedidoId: number, tipoDoc: "expediente_1" | "expediente_2", file: File) {
    if (!file) throw new Error("Seleccioná un archivo");
    if (file.type && file.type !== "application/pdf") throw new Error("Sólo PDF.");
    const fd = new FormData();
    fd.append("tipo_doc", tipoDoc);
    fd.append("archivo", file, file.name);
    const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/archivos`, {
      method: "POST",
      headers: { ...authHeaders(token) }, // NO setear Content-Type
      body: fd,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Upload ${tipoDoc} falló (${res.status}): ${t}`);
    }
    return res.json();
  }

  // inputs controlados (para no duplicar estados)
  const [exp1File, setExp1File] = useState<File | null>(null);
  const [exp2File, setExp2File] = useState<File | null>(null);

  // helpers admin revisión
  const formal = files.find(a => a.kind === "formal_pdf");
  const exp1Doc = files.find(a => a.kind === "expediente_1");
  const exp2Doc = files.find(a => a.kind === "expediente_2");

  async function refreshEstadoPedido(pId: number) {
    const res = await fetch(`${API_BASE}/ui/pedidos/${pId}`, {
      headers: { ...authHeaders(token) },
      cache: "no-store",
    });
    if (res.ok) {
      const det = await res.json();
      setSelected(s => (s ? { ...s, estado: det.estado } : s));
      // refrescar KPI en fila
      setItems(arr => arr.map(r => (r.id === pId ? { ...r, estado: det.estado } : r)));
    }
  }

  // acción genérica de revisión
  async function onReviewAction(archivoId: number, decision: ReviewDecision, notes?: string | null) {
    try {
      setActionBusy(true);
      await reviewArchivo(archivoId, decision, notes);
      await refreshArchivosLista(selected);
      await refreshEstadoPedido(selected!.id);
    } finally {
      setActionBusy(false);
    }
  }

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
              onOpen={(row) => { setSelected(row); setDrawerOpen(true); setActiveTab("info"); }}
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
                  {cap(selected.estado.replace("_"," "))}
                </Badge>
                <Badge>{selected.solicitante ?? "—"}</Badge>
                <Badge>{selected.secretaria ?? "—"}</Badge>
                {/* Indicador si ya hay PDF formal */}
                {loadingArchivos ? (
                  <Badge>Archivos…</Badge>
                ) : hasFormal ? (
                  <Badge tone="ok">PDF firmado</Badge>
                ) : null}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-[#2b3550]">
                {([
                  { key: "info",     label: "Info" },
                  { key: "archivos", label: "Archivos" },
                  { key: "estado",   label: "Estado" },
                  { key: "admin",    label: "Admin"  },
                ] as {key: TabKey; label: string}[]).map(t => (
                  <button
                    key={t.key}
                    className={`px-3 py-2 text-sm rounded-t-xl ${
                      activeTab === t.key ? "bg-[#141a2a] text-white border-x border-t border-[#2b3550]" : "text-[#9aa3b2] hover:text-white"
                    }`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Paneles */}
              {activeTab === "info" && (
                <>
                  {/* Generales */}
                  <div className="card">
                    <h4 className="text-base font-semibold mb-2">Información</h4>
                    <Row label="Módulo"       value={cap((selected.modulo ?? selected.tipo_ambito ?? "—").toString())} />
                    <Row label="Solicitante"  value={selected.solicitante ?? "—"} />
                    <Row label="Creado"       value={fmtDate(selected.creado)} />
                    <Row label="Total"        value={fmtMoney(selected.total)} />
                  </div>
                </>
              )}

              {activeTab === "archivos" && (
                <section className="card grid gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Archivos</h4>
                    <button className="btn-ghost" onClick={() => void refreshArchivosLista(selected)} disabled={filesLoading}>
                      {filesLoading ? "Refrescando…" : "Refrescar"}
                    </button>
                  </div>

                  <ArchivoFormalUploader
                    pedidoId={selected.id}
                    estado={selected.estado}
                    onUploaded={() => { setHasFormal(true); void refreshArchivosLista(selected); }}
                  />

                  <div className="rounded-2xl border border-[#2b3550] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="text-[#9aa3b2] bg-white/5">
                        <tr>
                          <th className="text-left px-3 py-2">Tipo</th>
                          <th className="text-left px-3 py-2">Nombre</th>
                          <th className="text-right px-3 py-2">Tamaño</th>
                          <th className="text-left px-3 py-2">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b2132]">
                        {filesLoading ? (
                          <tr><td className="px-3 py-3 text-[#9aa3b2]" colSpan={4}>Cargando…</td></tr>
                        ) : filesErr ? (
                          <tr><td className="px-3 py-3 text-red-300" colSpan={4}>{filesErr}</td></tr>
                        ) : files.length === 0 ? (
                          <tr><td className="px-3 py-3 text-[#9aa3b2]" colSpan={4}>No hay archivos formales subidos.</td></tr>
                        ) : (
                          files.map(a => (
                            <tr key={a.id}>
                              <td className="px-3 py-2">
                                {a.kind} {a.review_status ? <>&nbsp;·&nbsp;<ReviewBadge st={a.review_status} /></> : null}
                              </td>
                              <td className="px-3 py-2">
                                <a className="link" href={fileUrl(a.url, a.id)} target="_blank" rel="noreferrer">{a.filename}</a>
                                {a.review_notes ? <div className="text-xs text-[#9aa3b2] mt-0.5">Notas: {a.review_notes}</div> : null}
                              </td>
                              <td className="px-3 py-2 text-right">{Math.round((a.size_bytes ?? 0)/1024)} KB</td>
                              <td className="px-3 py-2">{a.uploaded_at ? new Date(a.uploaded_at).toLocaleString() : "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "estado" && (
                <section className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-semibold">Estado del trámite</h4>
                    <span className="text-xs text-[#9aa3b2]">Referencia visual</span>
                  </div>
                  <ol className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                    {["borrador","enviado","en_revision","aprobado","en_proceso","area_pago","cerrado"].map((k) => {
                      const reached = ["borrador","enviado","en_revision","aprobado","en_proceso","area_pago","cerrado"]
                        .indexOf(k) <= ["borrador","enviado","en_revision","aprobado","en_proceso","area_pago","cerrado"]
                        .indexOf(selected.estado);
                      return (
                        <li key={k} className="flex flex-col items-center gap-1">
                          <div className={`h-2 w-full rounded-full ${reached ? "bg-emerald-500" : "bg-[#1c2436]"}`} />
                          <div className="text-xs text-[#cfd6e6]">{cap(k.replace("_"," "))}</div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {activeTab === "admin" && (
                <section className="card grid gap-4">
                  {!user?.secretaria && (
                    <div className="text-yellow-400 text-sm">
                      Para aprobar / revisar necesitás tener una <b>Secretaría</b> en tu usuario.
                    </div>
                  )}

                  {/* Acciones de estado (Aprobar / En revisión / Rechazar con confirmación) */}
                  <ApprovalActions
                    canAct={canAct}
                    estadoActual={selected.estado}
                    loading={actionBusy}
                    onApprove={async () => {
                      if (!selected) return;
                      try {
                        setActionBusy(true);
                        await setEstadoPedido(selected.id, "aprobado", {
                          token,
                          user: user?.username,
                          secretaria: user?.secretaria ?? undefined,
                        });
                        setSelected(s => (s ? { ...s, estado: "aprobado" } : s));
                        setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "aprobado" } : r));
                        await checkArchivoFlags({ ...selected, estado: "aprobado" } as BackendPedido);
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                    onReview={async () => {
                      if (!selected) return;
                      try {
                        setActionBusy(true);
                        await setEstadoPedido(selected.id, "en_revision", {
                          token,
                          user: user?.username,
                          secretaria: user?.secretaria ?? undefined,
                        });
                        setSelected(s => (s ? { ...s, estado: "en_revision" } : s));
                        setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "en_revision" } : r));
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                    onReject={async (motivo?: string | null) => {
                      if (!selected) return;
                      try {
                        setActionBusy(true);
                        await setEstadoPedido(selected.id, "rechazado", {
                          token,
                          user: user?.username,
                          secretaria: user?.secretaria ?? undefined,
                          motivo: motivo ?? null,
                        });
                        setSelected(s => (s ? { ...s, estado: "rechazado" } : s));
                        setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "rechazado" } : r));
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                  />

                  {/* ====== FORMAL: revisión (Aprobar / Observar) ====== */}
                  <div className="rounded-xl border border-[#2b3550] p-3 grid gap-2">
                    <div className="text-sm flex flex-wrap items-center gap-2">
                      <b>PDF firmado (formal)</b>
                      {formal ? (
                        <>
                          <span className="text-[#9aa3b2]">·</span>
                          <a className="link" href={fileUrl(formal.url, formal.id)} target="_blank" rel="noreferrer">
                            {formal.filename}
                          </a>
                          <span className="text-[#9aa3b2]">· Revisión:</span> <ReviewBadge st={formal.review_status} />
                          {formal.review_notes ? <span className="text-[#9aa3b2]"> · Notas: {formal.review_notes}</span> : null}
                        </>
                      ) : (
                        <span className="text-[#9aa3b2]">Aún no se subió</span>
                      )}
                    </div>
                    {formal && (
                      <div className="flex gap-2">
                        <button
                          className="btn-ghost"
                          disabled={actionBusy || formal.review_status === "aprobado"}
                          onClick={() => onReviewAction(formal.id, "aprobado")}
                        >
                          Aprobar formal
                        </button>
                        <button
                          className="btn-ghost text-red-400 border border-red-500/40"
                          disabled={actionBusy}
                          onClick={async () => {
                            const notes = window.prompt("Motivo de observación (opcional):") ?? "";
                            await onReviewAction(formal.id, "observado", notes);
                          }}
                        >
                          Observar formal
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ====== EXPEDIENTE 1 (Contrataciones / Compras) ====== */}
                  <div className="rounded-xl border border-[#2b3550] p-3 grid gap-2">
                    <div className="text-sm">
                      <b>Expediente 1 – Contrataciones/Compras</b>
                      <div className="text-[#9aa3b2]">
                        Subir el PDF de expediente 1. Se habilita cuando el pedido tiene <i>PDF firmado</i> y está en
                        estado <code>en_proceso</code>. Luego <b>aprobalo/observalo</b> desde acá.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setExp1File(e.target.files?.[0] ?? null)}
                        disabled={!(selected.estado === "en_proceso" && hasFormal)}
                        className="file:btn file:mr-3"
                      />
                      <button
                        className="btn"
                        disabled={actionBusy || !exp1File || !(selected.estado === "en_proceso" && hasFormal)}
                        onClick={async () => {
                          if (!selected || !exp1File) return;
                          try {
                            setActionBusy(true);
                            await uploadTipoDoc(selected.id, "expediente_1", exp1File);
                            setExp1File(null);
                            await refreshArchivosLista(selected);
                          } catch (e:any) {
                            alert(e?.message ?? "Error subiendo expediente 1");
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                      >
                        Subir expediente 1
                      </button>
                    </div>
                    {exp1Doc ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div>
                          <a className="link" href={fileUrl(exp1Doc.url, exp1Doc.id)} target="_blank" rel="noreferrer">
                            {exp1Doc.filename}
                          </a>
                          <span className="text-[#9aa3b2]"> · Revisión:</span> <ReviewBadge st={exp1Doc.review_status} />
                          {exp1Doc.review_notes ? <span className="text-[#9aa3b2]"> · Notas: {exp1Doc.review_notes}</span> : null}
                        </div>
                        <div className="ml-auto flex gap-2">
                          <button
                            className="btn-ghost"
                            disabled={actionBusy || exp1Doc.review_status === "aprobado"}
                            onClick={() => onReviewAction(exp1Doc.id, "aprobado")}
                          >
                            Aprobar exp. 1
                          </button>
                          <button
                            className="btn-ghost text-red-400 border border-red-500/40"
                            disabled={actionBusy}
                            onClick={async () => {
                              const notes = window.prompt("Motivo de observación (opcional):") ?? "";
                              await onReviewAction(exp1Doc.id, "observado", notes);
                            }}
                          >
                            Observar exp. 1
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#9aa3b2]">Aún no se subió el expediente 1.</div>
                    )}
                  </div>

                  {/* ====== EXPEDIENTE 2 (Área de pago) ====== */}
                  <div className="rounded-xl border border-[#2b3550] p-3 grid gap-2">
                    <div className="text-sm">
                      <b>Expediente 2 – Área de pago</b>
                      <div className="text-[#9aa3b2]">
                        Subir el PDF de expediente 2 cuando el pedido esté en <code>area_pago</code>. Luego <b>aprobalo/observalo</b> desde acá.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setExp2File(e.target.files?.[0] ?? null)}
                        disabled={!(selected.estado === "area_pago" && hasExp1)}
                        className="file:btn file:mr-3"
                      />
                      <button
                        className="btn"
                        disabled={actionBusy || !exp2File || !(selected.estado === "area_pago" && hasExp1)}
                        onClick={async () => {
                          if (!selected || !exp2File) return;
                          try {
                            setActionBusy(true);
                            await uploadTipoDoc(selected.id, "expediente_2", exp2File);
                            setExp2File(null);
                            await refreshArchivosLista(selected);
                          } catch (e:any) {
                            alert(e?.message ?? "Error subiendo expediente 2");
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                      >
                        Subir expediente 2
                      </button>
                    </div>
                    {exp2Doc ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div>
                          <a className="link" href={fileUrl(exp2Doc.url, exp2Doc.id)} target="_blank" rel="noreferrer">
                            {exp2Doc.filename}
                          </a>
                          <span className="text-[#9aa3b2]"> · Revisión:</span> <ReviewBadge st={exp2Doc.review_status} />
                          {exp2Doc.review_notes ? <span className="text-[#9aa3b2]"> · Notas: {exp2Doc.review_notes}</span> : null}
                        </div>
                        <div className="ml-auto flex gap-2">
                          <button
                            className="btn-ghost"
                            disabled={actionBusy || exp2Doc.review_status === "aprobado"}
                            onClick={() => onReviewAction(exp2Doc.id, "aprobado")}
                          >
                            Aprobar exp. 2
                          </button>
                          <button
                            className="btn-ghost text-red-400 border border-red-500/40"
                            disabled={actionBusy}
                            onClick={async () => {
                              const notes = window.prompt("Motivo de observación (opcional):") ?? "";
                              await onReviewAction(exp2Doc.id, "observado", notes);
                            }}
                          >
                            Observar exp. 2
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#9aa3b2]">Aún no se subió el expediente 2.</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </Drawer>
      </div>
    </RequireAuth>
  );
}
