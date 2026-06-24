// app/api/qtrader/activate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/qtrader";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = (body.code || "").toString();
  if (verifyCode(code)) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false, reason: "Código inválido o incompleto." });
}
