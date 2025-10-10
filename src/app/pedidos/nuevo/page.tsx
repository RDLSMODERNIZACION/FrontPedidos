// src/app/pedidos/nuevo/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React from "react";
import NuevoPedidoWizard from "./NuevoWizard";

export default function PageNuevoPedido() {
  return <NuevoPedidoWizard />;
}
