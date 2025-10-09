'use client';
import { useMemo, useState } from "react";
import { Pedido } from "@/lib/types";
import { cap, fmtDate, fmtMoney } from "@/lib/utils";
import Badge from "./Badge";

type Props = {
  rows: Pedido[];
  onOpen: (row: Pedido) => void;
};

type Sort = { by: keyof Pedido; dir: "asc" | "desc" };

export default function PedidosTable({ rows, onOpen }: Props) {
  const [sort, setSort] = useState<Sort>({ by: "creado_en", dir: "desc" });

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const ka = a[sort.by] as any;
      const kb = b[sort.by] as any;
      if (sort.by === "total") return (ka - kb) * dir;
      return String(ka).localeCompare(String(kb)) * dir;
    });
    return arr;
  }, [rows, sort]);

  const Th = ({ k, children, className }:{ k: keyof Pedido; children: React.ReactNode; className?: string }) => (
    <th className={className} onClick={() => setSort(s => s.by === k ? { by: k, dir: (s.dir === "asc" ? "desc" : "asc") } : { by: k, dir: "asc" })} style={{ cursor: "pointer" }}>{children}</th>
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
            <Th k="creado_en">Creado</Th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.id}>
              <td className="font-mono">{r.id_tramite}</td>
              <td>{cap(r.modulo)}</td>
              <td><small className="text-[#9aa3b2]">{r.secretaria}</small></td>
              <td>{r.solicitante}</td>
              <td>
                <Badge tone={r.estado === "aprobado" || r.estado === "cerrado" ? "ok" : r.estado === "rechazado" ? "bad" : "warn"}>
                  {cap(r.estado)}
                </Badge>
              </td>
              <td className="text-right">{fmtMoney(r.total)}</td>
              <td><small className="text-[#9aa3b2]">{fmtDate(r.creado_en)}</small></td>
              <td className="text-right">
                <button className="icon-btn" onClick={() => onOpen(r)}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
