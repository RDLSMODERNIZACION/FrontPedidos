import { NextResponse } from "next/server";
import { SECRETARIAS } from "@/lib/data";

export async function GET() {
  return NextResponse.json(SECRETARIAS);
}
