// src/components/PedidosTable.tsx
'use client';

import { useMemo, useState } from "react";
import Badge from "./Badge";
import { cap, fmtDate, fmtMoney } from "@/lib/utils";
import type { BackendPedido } from "@/lib/api";

type Props = {
  rows: BackendPedido[];
  onOpen: (row: BackendPedido) => void;
};

// claves habilitadas para orden
type SortKey = "id_tramite" | "modulo" | "secretaria" | "solicitante" | "estado" | "total" | "creado";
type Sort = { by: SortKey; dir: "asc" | "desc" };

// normaliza el valor a usar para ordenar según la columna
function getOrderValue(row: BackendPedido, by: SortKey): string | number {
  switch (by) {
    case "total": {
      const n = row.total === null ? 0 : Number(row.total);
      return Number.isNaN(n) ? 0 : n;
    }
    case "creado": {
      const t = row.creado ? Date.parse(row.creado) : 0;
      return Number.isNaN(t) ? 0 : t;
    }
    case "modulo": {
      // mostrar/ordenar por módulo; si no hay, caer al tipo_ambito
      return (row.modulo ?? row.tipo_ambito ?? "").toString();
    }
    case "solicitante":
      return (row.solicitante ?? "").toString();
    case "id_tramite":
      return (row.id_tramite ?? `#${row.id}`).toString();
    default:
      return (row[by] as any ?? "").toString();
  }
}

export default function PedidosTable({ rows, onOpen }: Props) {
  const [sort, setSort] = useState<Sort>({ by: "creado", dir: "desc" });

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = getOrderValue(a, sort.by);
      const vb = getOrderValue(b, sort.by);
      const dir = sort.dir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb)) * dir;
    });
    return arr;
  }, [rows, sort]);

  const Th = ({
    k,
    children,
    className,
  }: {
    k: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      className={className}
      onClick={() =>
        setSort((s) =>
          s.by === k ? { by: k, dir: s.dir === "asc" ? "desc" : "asc" } : { by: k, dir: "asc" }
        )
      }
      style={{ cursor: "pointer", userSelect: "none" }}
      title="Ordenar"
    >
      {children}
      {sort.by === k ? (sort.dir === "asc" ? " ↑" : " ↓") : null}
    </th>
  );

  return (
    <div className="border border-[#1b2132] rounded-2xl overflow-auto">
      <table className="table min-w-[880px]">
        <thead>
          <tr>
            <Th k="id_tramite">ID Trámite</Th>
            <Th k="modulo">Módulo</Th>
            <Th k="secretaria">Secretaría</Th>
            <Th k="solicitante">Solicitante</Th>
            <Th k="estado">Estado</Th>
            <Th k="total" className="text-right">Total</Th>
            <Th k="creado">Creado</Th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td className="font-mono">{r.id_tramite ?? `#${r.id}`}</td>
              <td>{cap((r.modulo ?? r.tipo_ambito ?? "—").toString())}</td>
              <td><small className="text-[#9aa3b2]">{r.secretaria}</small></td>
              <td>{r.solicitante ?? "—"}</td>
              <td>
                <Badge
                  tone={
                    r.estado === "aprobado" || r.estado === "cerrado"
                      ? "ok"
                      : r.estado === "rechazado"
                      ? "bad"
                      : "warn"
                  }
                >
                  {cap(r.estado)}
                </Badge>
              </td>
              <td className="text-right">{fmtMoney(r.total)}</td>
              <td><small className="text-[#9aa3b2]">{fmtDate(r.creado)}</small></td>
              <td className="text-right">
                <button className="icon-btn" onClick={() => onOpen(r)}>Ver</button>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-slate-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
