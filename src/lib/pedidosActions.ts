// src/lib/pedidosActions.ts
export type UpdateEstadoOpts = {
  token?: string;         // Authorization: Bearer ...
  user?: string;          // X-User
  secretaria?: string;    // X-Secretaria
  motivo?: string | null; // opcional
};

export async function setEstadoPedido(
  id: number,
  estado: "aprobado" | "en_revision",
  opts: UpdateEstadoOpts = {}
) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  const url = `${base}/ui/pedidos/${id}/estado`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts.user) headers["X-User"] = String(opts.user);
  if (opts.secretaria) headers["X-Secretaria"] = String(opts.secretaria);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      estado,
      ...(opts.motivo ? { motivo: opts.motivo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`No se pudo actualizar el estado (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}
