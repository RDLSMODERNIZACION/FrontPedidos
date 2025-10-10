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

// 👇 archivos (uploader + helper para detectar formal_pdf)
import ArchivoFormalUploader from "@/components/pedidos/ArchivoFormalUploader";
import { listPedidoArchivos, type PedidoArchivo, fileUrl } from "@/lib/pedidos";

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
        headers: { ...authHeaders(auth?.token) },
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
  const [loadingArchivos, setLoadingArchivos] = useState<boolean>(false);

  const [files, setFiles] = useState<PedidoArchivo[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesErr, setFilesErr] = useState<string | null>(null);

  // Consulta liviana para el chip (PDF firmado)
  async function checkFormal(p: BackendPedido | null) {
    if (!p) { setHasFormal(false); return; }
    try {
      setLoadingArchivos(true);
      const archs: PedidoArchivo[] = await listPedidoArchivos(p.id);
      setHasFormal(archs.some(a => a.kind === "formal_pdf"));
    } catch {
      setHasFormal(false);
    } finally {
      setLoadingArchivos(false);
    }
  }
  useEffect(() => { void checkFormal(selected); }, [selected?.id]);

  // Lista completa sólo al abrir pestaña Archivos
  async function refreshArchivosLista(p: BackendPedido | null) {
    if (!p) { setFiles([]); setFilesErr(null); return; }
    try {
      setFilesLoading(true);
      setFilesErr(null);
      const archs = await listPedidoArchivos(p.id);
      setFiles(archs);
      setHasFormal(archs.some(a => a.kind === "formal_pdf"));
    } catch (e:any) {
      setFilesErr(e?.message ?? "Error al listar archivos");
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }
  useEffect(() => {
    if (activeTab === "archivos" && selected?.id) void refreshArchivosLista(selected);
  }, [activeTab, selected?.id]);

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
                  {/* Generales (como ya tenías) */}
                  <div className="card">
                    <h4 className="text-base font-semibold mb-2">Información</h4>
                    <Row label="Módulo"       value={cap((selected.modulo ?? selected.tipo_ambito ?? "—").toString())} />
                    <Row label="Solicitante"  value={selected.solicitante ?? "—"} />
                    <Row label="Creado"       value={fmtDate(selected.creado)} />
                    <Row label="Total"        value={fmtMoney(selected.total)} />
                  </div>

                  {/* Ambiente (cuando exista en detalle) */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold">Ambiente</h4>
                      <button className="btn-ghost" onClick={() => void fetchDetalle(selected)} disabled={detalleLoading}>
                        {detalleLoading ? "Refrescando…" : "Refrescar"}
                      </button>
                    </div>
                    {!detalleLoading && !detalle?.ambito && (
                      <div className="text-sm text-[#9aa3b2]">Sin ambiente (o no disponible).</div>
                    )}
                    {!!detalle?.ambito && (
                      <>
                        <Row label="Tipo" value={detalle.ambito.tipo} />
                        {detalle.ambito.tipo === "obra" && (
                          <>
                            <Row label="Nombre de la obra" value={detalle.ambito.obra?.obra_nombre ?? "—"} />
                          </>
                        )}
                        {detalle.ambito.tipo === "mantenimientodeescuelas" && (
                          <Row label="Escuela" value={detalle.ambito.escuelas?.escuela ?? "—"} />
                        )}
                      </>
                    )}
                    {!!detalleErr && <div className="text-xs text-amber-300 mt-2">{detalleErr}</div>}
                  </div>

                  {/* Módulo (cuando exista en detalle) */}
                  <div className="card">
                    <h4 className="text-base font-semibold mb-2">Módulo — Detalle</h4>
                    {!detalleLoading && !detalle?.modulo && (
                      <div className="text-sm text-[#9aa3b2]">Detalle de módulo no disponible.</div>
                    )}
                    {!!detalle?.modulo && (
                      <>
                        <Row label="Tipo" value={detalle.modulo.tipo} />
                        {/* Servicios */}
                        {detalle.modulo.tipo === "servicios" && (
                          <>
                            <Row label="Tipo de servicio" value={detalle.modulo.tipo_servicio} />
                            {detalle.modulo.tipo_servicio === "mantenimiento" && (
                              <Row label="Detalle" value={detalle.modulo.detalle_mantenimiento ?? "—"} />
                            )}
                            {detalle.modulo.tipo_servicio === "profesionales" && (
                              <>
                                <Row label="Tipo profesional" value={detalle.modulo.tipo_profesional ?? "—"} />
                                <Row label="Día(s)" value={`${detalle.modulo.dia_desde ?? "—"} · ${detalle.modulo.dia_hasta ?? "—"}`} />
                              </>
                            )}
                          </>
                        )}

                        {/* Alquiler */}
                        {detalle.modulo.tipo === "alquiler" && (
                          <>
                            <Row label="Categoría" value={detalle.modulo.categoria} />
                            {detalle.modulo.categoria === "edificio" && (
                              <>
                                <Row label="Uso" value={detalle.modulo.uso_edificio ?? "—"} />
                                <Row label="Ubicación" value={detalle.modulo.ubicacion_edificio ?? "—"} />
                              </>
                            )}
                            {detalle.modulo.categoria === "maquinaria" && (
                              <>
                                <Row label="Uso" value={detalle.modulo.uso_maquinaria ?? "—"} />
                                <Row label="Tipo" value={detalle.modulo.tipo_maquinaria ?? "—"} />
                                <Row label="Combustible / Chofer" value={`${detalle.modulo.requiere_combustible ? "Sí" : "No"} · ${detalle.modulo.requiere_chofer ? "Sí" : "No"}`} />
                                <Row label="Cronograma" value={`${detalle.modulo.cronograma_desde ?? "—"} · ${detalle.modulo.cronograma_hasta ?? "—"}`} />
                                <Row label="Horas por día" value={detalle.modulo.horas_por_dia ?? "—"} />
                              </>
                            )}
                            {detalle.modulo.categoria === "otros" && (
                              <>
                                <Row label="Qué alquilar" value={detalle.modulo.que_alquilar ?? "—"} />
                                <Row label="Detalle de uso" value={detalle.modulo.detalle_uso ?? "—"} />
                              </>
                            )}
                          </>
                        )}

                        {/* Adquisición */}
                        {detalle.modulo.tipo === "adquisicion" && (
                          <>
                            <Row label="Propósito" value={detalle.modulo.proposito ?? "—"} />
                            <Row label="Modo" value={detalle.modulo.modo_adquisicion ?? "—"} />
                            <div className="mt-2 rounded-xl border border-[#2b3550] overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="text-[#9aa3b2] bg-white/5">
                                  <tr>
                                    <th className="text-left px-3 py-2">Descripción</th>
                                    <th className="text-right px-3 py-2">Cant.</th>
                                    <th className="text-left px-3 py-2">Unidad</th>
                                    <th className="text-right px-3 py-2">Precio unit.</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1b2132]">
                                  {Array.isArray(detalle.modulo.items) && detalle.modulo.items.length > 0 ? (
                                    detalle.modulo.items.map((it:any, i:number) => (
                                      <tr key={i}>
                                        <td className="px-3 py-2">{it.descripcion}</td>
                                        <td className="px-3 py-2 text-right">{it.cantidad ?? 1}</td>
                                        <td className="px-3 py-2">{it.unidad ?? "—"}</td>
                                        <td className="px-3 py-2 text-right">{it.precio_unitario ?? "—"}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr><td className="px-3 py-3 text-[#9aa3b2]" colSpan={4}>Sin ítems.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {/* Reparación */}
                        {detalle.modulo.tipo === "reparacion" && (
                          <>
                            <Row label="Tipo reparación" value={detalle.modulo.tipo_reparacion} />
                            {detalle.modulo.tipo_reparacion === "maquinaria" ? (
                              <>
                                <Row label="Unidad a reparar" value={detalle.modulo.unidad_reparar ?? "—"} />
                                <Row label="Detalle" value={detalle.modulo.detalle_reparacion ?? "—"} />
                              </>
                            ) : (
                              <>
                                <Row label="Qué reparar" value={detalle.modulo.que_reparar ?? "—"} />
                                <Row label="Detalle" value={detalle.modulo.detalle_reparacion ?? "—"} />
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
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
                              <td className="px-3 py-2">{a.kind}</td>
                              <td className="px-3 py-2">
                                <a className="link" href={fileUrl(a.url)} target="_blank" rel="noreferrer">{a.filename}</a>
                              </td>
                              <td className="px-3 py-2 text-right">{Math.round(a.size_bytes/1024)} KB</td>
                              <td className="px-3 py-2">{new Date(a.uploaded_at).toLocaleString()}</td>
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
                    <span className="text-xs text-[#9aa3b2]">Próximamente: fuente desde backend</span>
                  </div>
                  <ol className="flex items-center justify-between gap-2">
                    {["enviado","en_revision","aprobado","rechazado","cerrado"].map((k) => {
                      const reached = k === selected.estado
                        ? true
                        : ["enviado","en_revision","aprobado","rechazado","cerrado"].indexOf(k)
                          <= ["enviado","en_revision","aprobado","rechazado","cerrado"].indexOf(selected.estado);
                      return (
                        <li key={k} className="flex-1">
                          <div className={`h-2 rounded-full ${reached ? "bg-emerald-500" : "bg-[#1c2436]"}`} />
                          <div className="mt-1 text-xs text-[#cfd6e6]">{cap(k.replace("_"," "))}</div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {activeTab === "admin" && (
                <section className="card grid gap-3">
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
                        await checkFormal({ ...selected, estado: "aprobado" } as BackendPedido);
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
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                    onReject={async () => {
                      if (!selected) return;
                      try {
                        setActionBusy(true);
                        await setEstadoPedido(selected.id, "rechazado", {
                          token: auth?.token,
                          user: auth?.user?.username,
                          secretaria: auth?.user?.secretaria ?? undefined,
                        });
                        setSelected(s => (s ? { ...s, estado: "rechazado" } : s));
                        setItems(arr => arr.map(r => r.id === selected.id ? { ...r, estado: "rechazado" } : r));
                      } finally {
                        setActionBusy(false);
                      }
                    }}
                  />
                </section>
              )}
            </div>
          ) : null}
        </Drawer>
      </div>
    </RequireAuth>
  );
}
