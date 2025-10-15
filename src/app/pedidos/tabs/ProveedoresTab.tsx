// src/app/pedidos/tabs/ProveedoresTab.tsx
"use client";

import { useEffect, useState } from "react";
import {
  agregarProveedorAPedido,
  buscarProveedores,
  listarProveedoresDePedido,
  upsertProveedor,
  updateProveedor,
  desvincularProveedorDePedido,
  type ProveedorVinculado,
} from "@/lib/proveedores";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[#c6d0e1]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function ProveedoresTab({ pedidoId }: { pedidoId?: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vinculados, setVinculados] = useState<ProveedorVinculado[]>([]);

  // búsqueda / alta rápida
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    Array<{ id: number; cuit: string; razon_social: string; telefono?: string | null }>
  >([]);
  const [creating, setCreating] = useState(false);

  // alta/edición proveedor (upsert)
  const [cuit, setCuit] = useState("");
  const [razon, setRazon] = useState("");
  const [tel, setTel] = useState("");

  // edición inline
  const [editId, setEditId] = useState<number | null>(null);
  const [editRazon, setEditRazon] = useState("");
  const [editTel, setEditTel] = useState("");

  const canSearch = q.trim().length >= 2;
  const canCreate = cuit.trim().length >= 8 && razon.trim().length >= 2;

  async function refreshVinculados() {
    if (!pedidoId) return;
    try {
      setLoading(true);
      setError(null);
      const rows = await listarProveedoresDePedido(pedidoId, 50);
      setVinculados(rows);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar proveedores vinculados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshVinculados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  // búsqueda con debounce suave
  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setError(null);
        const rows = await buscarProveedores(q, 10);
        setResults(
          rows.map((r) => ({
            id: r.id,
            cuit: r.cuit,
            razon_social: r.razon_social,
            telefono: r.telefono ?? null,
          }))
        );
      } catch (e: any) {
        setError(e?.message ?? "Error buscando proveedores");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, canSearch]);

  async function handleVincular(cuitArg: string, razonSocial?: string, telefono?: string) {
    if (!pedidoId) return;
    try {
      setLoading(true);
      setError(null);
      // Alta rápida de proveedor (por si no existe) + vínculo al pedido
      await upsertProveedor({
        cuit: cuitArg,
        razon_social: razonSocial || `Proveedor ${cuitArg.replace(/\D/g, "")}`,
        telefono: telefono && telefono.trim() ? telefono : undefined,
        transfer_if_in_use: false,
      });
      await agregarProveedorAPedido({
        pedido_id: pedidoId,
        cuit: cuitArg,
        rol: "consulta",
        telefono: telefono && telefono.trim() ? telefono : undefined,
      });
      setQ("");
      setResults([]);
      setCreating(false);
      setCuit("");
      setRazon("");
      setTel("");
      await refreshVinculados();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo vincular el proveedor");
    } finally {
      setLoading(false);
    }
  }

  function startEditar(p: ProveedorVinculado) {
    setEditId(p.proveedor_id);
    setEditRazon(p.razon_social ?? "");
    setEditTel(p.telefono ?? "");
  }

  async function guardarEdicion() {
    if (!editId) return;
    try {
      setLoading(true);
      setError(null);
      await updateProveedor(editId, {
        razon_social: editRazon || undefined,
        telefono: editTel || undefined,
        transfer_if_in_use: false,
      });
      setEditId(null);
      await refreshVinculados();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo actualizar el proveedor");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuitar(proveedorId: number) {
    if (!pedidoId) return;
    try {
      setLoading(true);
      setError(null);
      await desvincularProveedorDePedido(pedidoId, proveedorId);
      await refreshVinculados();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo quitar el proveedor del expediente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Columna A: Proveedores vinculados */}
      <section className="rounded-xl border border-[#2b3550] p-4 bg-[#121a2b]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Proveedores vinculados</h3>
          {loading && <span className="text-xs text-[#9aa3b2]">cargando…</span>}
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-300 bg-[#2a1e1e] border border-[#523737] rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {vinculados.length === 0 ? (
          <div className="mt-2 text-sm text-[#9aa3b2]">
            No hay proveedores vinculados a este expediente.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {vinculados.map((p) => (
              <li key={`${p.proveedor_id}-${p.rol}`} className="rounded-lg border border-[#2b3550] p-3">
                {editId === p.proveedor_id ? (
                  // ====== Modo edición ======
                  <div className="grid gap-2">
                    <div className="text-sm text-[#9aa3b2]">Editando: {p.razon_social || p.cuit}</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Razón social">
                        <input
                          value={editRazon}
                          onChange={(e) => setEditRazon(e.target.value)}
                          className="w-full rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
                        />
                      </Field>
                      <Field label="Teléfono (E.164)">
                        <input
                          value={editTel}
                          onChange={(e) => setEditTel(e.target.value)}
                          placeholder="+54..."
                          className="w-full rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
                        />
                      </Field>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md bg-[#1b2338] border border-[#2b3550] text-white text-sm hover:bg-[#223058]"
                        onClick={() => void guardarEdicion()}
                        disabled={loading}
                      >
                        Guardar
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md bg-[#2a1e1e] border border-[#523737] text-white text-sm"
                        onClick={() => setEditId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // ====== Vista normal ======
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.razon_social || p.cuit}</div>
                      <div className="text-xs text-[#9aa3b2]">
                        CUIT: {p.cuit} · rol: <span className="uppercase">{p.rol}</span>
                      </div>
                      {!p.telefono ? (
                        <div className="mt-1 inline-flex items-center gap-2 text-xs text-red-300">
                          <span className="px-2 py-0.5 rounded bg-[#3a2323] border border-[#5a3434]">SIN TELÉFONO</span>
                          <span>Agregalo para habilitar consultas por WhatsApp.</span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-[#9aa3b2]">Tel: {p.telefono}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md bg-[#1b2338] border border-[#2b3550] text-white text-sm hover:bg-[#223058]"
                        onClick={() => startEditar(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md bg-[#2a1e1e] border border-[#523737] text-white text-sm hover:bg-[#4a2c2c]"
                        onClick={() => void handleQuitar(p.proveedor_id)}
                        disabled={loading}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Columna B: Buscar / crear y vincular */}
      <section className="rounded-xl border border-[#2b3550] p-4 bg-[#121a2b]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Agregar proveedor</h3>
          <button
            onClick={() => setCreating((v) => !v)}
            className="text-xs underline text-[#c6d0e1]"
          >
            {creating ? "Buscar existente" : "Crear nuevo"}
          </button>
        </div>

        {!creating && (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por razón social o CUIT…"
              className="w-full mt-2 rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
            />

            {!q && (
              <div className="mt-3 text-xs text-[#9aa3b2]">
                Empezá a tipear (mínimo 2 caracteres) para buscar proveedores existentes.
              </div>
            )}

            {q && results.length === 0 && (
              <div className="mt-3 text-xs text-[#9aa3b2]">Sin resultados para “{q}”.</div>
            )}

            {results.length > 0 && (
              <ul className="mt-3 space-y-2">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#2b3550] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.razon_social}</div>
                      <div className="text-xs text-[#9aa3b2]">
                        CUIT: {r.cuit} · {r.telefono ? r.telefono : "sin teléfono"}
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-md bg-[#1b2338] border border-[#2b3550] text-white text-sm hover:bg-[#223058]"
                      onClick={() => handleVincular(r.cuit)}
                    >
                      Vincular
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {creating && (
          <div className="mt-2 grid grid-cols-1 gap-3">
            <Field label="CUIT">
              <input
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="20-00000000-0"
                className="w-full rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
              />
            </Field>
            <Field label="Razón social">
              <input
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                placeholder="Proveedor S.A."
                className="w-full rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
              />
            </Field>
            <Field label="Teléfono (E.164)">
              <input
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="+542993251398"
                className="w-full rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
              />
            </Field>

            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-md bg-[#1b2338] border border-[#2b3550] text-white text-sm hover:bg-[#223058] disabled:opacity-50"
                disabled={!canCreate || !pedidoId || loading}
                onClick={() => handleVincular(cuit, razon, tel)}
              >
                Crear y vincular
              </button>
              <button
                className="px-4 py-2 rounded-md bg-[#2a1e1e] border border-[#523737] text-white text-sm"
                onClick={() => {
                  setCreating(false);
                  setCuit("");
                  setRazon("");
                  setTel("");
                }}
              >
                Cancelar
              </button>
            </div>

            <div className="text-xs text-[#9aa3b2]">
              Si el teléfono ya estuviera usado por otro proveedor, el backend devolverá <code>409</code>.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
