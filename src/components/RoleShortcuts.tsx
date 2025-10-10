"use client";

import Link from "next/link";

export type RoleShortcutsProps = {
  role?: "compras" | "mesa" | "secretaria" | "admin";
};

const byRole: Record<string, { title: string; desc: string; href: string }[]> = {
  compras: [
    { title: "Emitir OC", desc: "Documentos y plazos", href: "/oc" },
    { title: "Proveedores", desc: "Altas y vigencias", href: "/proveedores" },
    { title: "Reportes", desc: "Seguimiento mensual", href: "/reportes" },
  ],
  mesa: [
    { title: "Derivar a revisión", desc: "Control de forma y fondo", href: "/derivar" },
    { title: "Recepcionar anexos", desc: "Pliegos, presupuestos", href: "/anexos" },
  ],
  secretaria: [
    { title: "Firmas pendientes", desc: "Revisar y firmar", href: "/firmas" },
    { title: "Prioridades", desc: "Pedidos urgentes", href: "/prioridades" },
  ],
  admin: [
    { title: "Configuración", desc: "Catálogos y permisos", href: "/config" },
    { title: "Auditoría", desc: "Cambios y usuarios", href: "/auditoria" },
  ],
};

export default function RoleShortcuts({ role = "compras" }: RoleShortcutsProps) {
  const items = byRole[role] ?? [];
  return (
    <section aria-label="Atajos por rol" className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-semibold text-sm mb-3">Atajos · {role}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05]"
          >
            <div className="font-medium text-sm">{a.title}</div>
            <div className="text-xs text-[#9aa3b2]">{a.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
