// src/components/pedidos/tabs/ProveedoresTab.tsx
'use client';

import { useState } from "react";

export default function ProveedoresTab({
  pedidoId,
}: {
  pedidoId?: number; // opcional: solo visual por ahora
}) {
  const [q, setQ] = useState("");

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Columna A: Vinculados (UI solamente) */}
      <section className="rounded-xl border border-[#2b3550] p-4 bg-[#121a2b]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Proveedores vinculados</h3>
          <span className="text-xs text-[#9aa3b2]">UI (sin conexión)</span>
        </div>

        <div className="text-sm text-[#9aa3b2]">
          No hay proveedores vinculados.
        </div>

        {/* Ejemplo visual deshabilitado */}
        <ul className="mt-3 space-y-2">
          <li className="flex items-center justify-between gap-3 rounded-lg border border-[#2b3550] px-3 py-2 opacity-60">
            <div className="min-w-0">
              <div className="font-medium truncate">Proveedor ejemplo S.A.</div>
              <div className="text-xs text-[#9aa3b2]">
                CUIT: 00-00000000-0 · vinculado: —
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-md bg-[#2a1e1e] border border-[#523737] text-white text-sm opacity-50 cursor-not-allowed"
              disabled
              title="Solo UI (luego conectamos)"
            >
              Quitar
            </button>
          </li>
        </ul>
      </section>

      {/* Columna B: Buscar y asignar (UI solamente) */}
      <section className="rounded-xl border border-[#2b3550] p-4 bg-[#121a2b]">
        <h3 className="text-base font-semibold mb-3">
          Buscar y asignar {pedidoId ? `(Pedido #${pedidoId})` : ""}
        </h3>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, CUIT, email…"
          className="w-full mb-3 rounded-md bg-[#0f1524] border border-[#2b3550] px-3 py-2 text-sm outline-none focus:border-[#3b4a76]"
        />

        {!q && (
          <div className="text-sm text-[#9aa3b2]">
            Escribí para simular la búsqueda. (Luego conectamos a la API)
          </div>
        )}

        {q && (
          <ul className="mt-3 space-y-2">
            <li className="flex items-center justify-between gap-3 rounded-lg border border-[#2b3550] px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  Resultado visual para “{q}”
                </div>
                <div className="text-xs text-[#9aa3b2]">
                  CUIT: — · proveedor@correo.com · +54 9 …
                </div>
              </div>
              <button
                className="px-3 py-1.5 rounded-md bg-[#1b2338] border border-[#2b3550] text-white text-sm opacity-50 cursor-not-allowed"
                disabled
                title="Solo UI (luego conectamos)"
              >
                Asignar
              </button>
            </li>
          </ul>
        )}

        {!q && (
          <div className="mt-3 text-xs text-[#9aa3b2]">
            Tip: luego esto llamará a <code>/ui/proveedores/search</code> y a{" "}
            <code>/pedidos/:id/proveedores</code>.
          </div>
        )}
      </section>
    </div>
  );
}
