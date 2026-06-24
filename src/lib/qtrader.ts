// lib/qtrader.ts — generar y validar codigos QTrader (servidor)
import crypto from "crypto";

const CS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0,O,1,I

function secret() {
  return process.env.QTRADER_SECRET || "QTrader-SacredLevels-2026-CAMBIA-ESTO";
}

function checkOf(core: string): string {
  const h = crypto.createHmac("sha256", secret()).update(core).digest();
  let s = "";
  for (let i = 0; i < 4; i++) s += CS[h[i] % 32];
  return s;
}

export function makeCode(): string {
  const b = crypto.randomBytes(8);
  let core = "";
  for (let i = 0; i < 8; i++) core += CS[b[i] % 32];
  return "QTR-" + core.slice(0, 4) + "-" + core.slice(4, 8) + "-" + checkOf(core);
}

export function normalizeCode(code: string): string {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function verifyCode(code: string): boolean {
  let n = normalizeCode(code);
  if (n.length === 15 && n.startsWith("QTR")) n = n.slice(3);
  if (n.length !== 12) return false;
  const core = n.slice(0, 8), chk = n.slice(8, 12);
  return checkOf(core) === chk;
}
