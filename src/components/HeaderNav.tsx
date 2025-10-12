// src/components/HeaderNav.tsx
"use client";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import NavLink from "@/components/NavLink";

export default function HeaderNav() {
  const { ready, isAuthenticated } = useAuthStatus();

  if (!ready) {
    return (
      <div className="flex items-center gap-2">
        <span className="btn-ghost invisible">Dashboard</span>
        <span className="btn-ghost invisible">Pedidos</span>
        <span className="btn invisible">Nuevo pedido</span>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2">
      <NavLink href="/" exact>Dashboard</NavLink>
      <NavLink href="/pedidos" exact>Pedidos</NavLink>      {/* 👈 exact */}
      <NavLink href="/pedidos/nuevo" exact>Nuevo pedido</NavLink>
    </div>
  );
}
