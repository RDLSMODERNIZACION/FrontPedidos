// src/app/pedidos/nuevo/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, { useMemo } from "react";
import NuevoPedidoWizard from "./NuevoWizard";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

export default function PageNuevoPedido() {
  const { user } = useAuth();

  // Secretaría robusta desde el contexto (con alias comunes)
  const secretaria = useMemo(
    () =>
      user?.secretaria ??
      (user as any)?.department ??
      (user as any)?.departamento ??
      null,
    [user]
  );

  return (
    <RequireAuth>
      {/* 👉 ya NO mostramos cabecera propia para evitar duplicado */}
      <NuevoPedidoWizard secretariaDefault={secretaria ?? undefined} />
    </RequireAuth>
  );
}
