// src/components/Filters.tsx
'use client';

type Props = {
  q: string;
  estado: string;
  secretaria: string;
  onChange: (next: { q?: string; estado?: string; secretaria?: string }) => void;
};

// Catálogo local (o podés traerlo del backend cuando tengas /ui/pedidos/options)
const SECRETARIAS = [
  "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS",
  "SECRETARÍA DE GESTIÓN AMBIENTAL Y DESARROLLO URBANO",
  "SECRETARÍA DE DESARROLLO HUMANO",
  "SECRETARÍA DE OBRAS Y SERVICIOS PÚBLICOS",
];

export default function Filters({ q, estado, secretaria, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Secretaría</span>
        <select
          className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[220px]"
          value={secretaria}
          onChange={(e) => onChange({ secretaria: e.target.value })}
        >
          <option value="">Todas</option>
          {SECRETARIAS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Estado</span>
        <select
          className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[180px]"
          value={estado}
          onChange={(e) => onChange({ estado: e.target.value })}
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

      <label className="grid gap-1 text-[#9aa3b2]">
        <span>Buscar</span>
        <input
          className="bg-panel2 border border-[#27314a] rounded-xl px-3 py-2 min-w-[260px]"
          placeholder="texto libre…"
          value={q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </label>
    </div>
  );
}
