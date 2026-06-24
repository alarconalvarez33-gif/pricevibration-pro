// app/api/qtrader/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { makeCode } from "@/lib/qtrader";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== process.env.QTRADER_ADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ code: makeCode() });
}
