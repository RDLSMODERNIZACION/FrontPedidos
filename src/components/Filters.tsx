'use client';
import { SECRETARIAS } from "@/lib/data";

export function Filters({ onChange }: { onChange: (f: { secretaria: string; estado: string; q: string; }) => void }) {
  return (
    <section className="card">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[#9aa3b2]">
          <span>Secretaría</span>
          <select className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[220px]"
            onChange={e => onChange({ secretaria: e.target.value, estado: "", q: "" })}>
            <option value="">Todas</option>
            {SECRETARIAS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-[#9aa3b2]">
          <span>Estado</span>
          <select id="estado" className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[180px]"
            onChange={e => onChange({ secretaria: (document.querySelector('select') as HTMLSelectElement).value, estado: e.target.value, q: (document.getElementById('q') as HTMLInputElement)?.value || '' })}>
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
          <input id="q" className="w-full bg-panel2 border border-[#27314a] rounded-xl px-3 py-2" placeholder="ID trámite, solicitante, módulo..." onInput={e => onChange({ secretaria: (document.querySelector('select') as HTMLSelectElement).value, estado: (document.getElementById('estado') as HTMLSelectElement)?.value || '', q: (e.target as HTMLInputElement).value })} />
        </label>

        <div className="ml-auto flex gap-2">
          <button className="btn-ghost" onClick={() => {
            (document.querySelector('select') as HTMLSelectElement).value = "";
            (document.getElementById('estado') as HTMLSelectElement).value = "";
            (document.getElementById('q') as HTMLInputElement).value = "";
            onChange({ secretaria: "", estado: "", q: "" });
          }}>Limpiar</button>
        </div>
      </div>
    </section>
  );
}
