import { NextResponse } from "next/server";
import { SECRETARIAS } from "@/lib/datadisable";

export async function GET() {
  return NextResponse.json(SECRETARIAS);
}
