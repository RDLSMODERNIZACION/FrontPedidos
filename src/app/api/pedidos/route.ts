import { NextResponse } from "next/server";

let MEM: any[] = [];

export async function GET() {
  return NextResponse.json(MEM);
}

export async function POST(req: Request) {
  const data = await req.json();
  const now = new Date().toISOString();

  const created = {
    id: Math.random().toString(16).slice(2, 6),
    id_tramite: data.id_tramite,
    modulo: data.modulo,
    secretaria: "SECRETARÍA DE ECONOMIA HACIENDA Y FINANZAS PUBLICAS", // o tomalo del form si lo querés persistir acá
    solicitante: "Usuario Demo",
    estado: "borrador",
    total: data.total ?? 0,
    creado_en: now,
    _payload: data.payload,
  };

  MEM = [created, ...MEM];
  return NextResponse.json(created, { status: 201 });
}
