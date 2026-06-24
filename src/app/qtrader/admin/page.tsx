"use client";
import { useState } from "react";

export default function QTraderAdmin() {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [hist, setHist] = useState<string[]>([]);

  async function gen() {
    setErr("");
    try {
      const r = await fetch("/api/qtrader/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
      });
      const j = await r.json();
      if (!r.ok || !j.code) { setErr(j.error || "Error"); return; }
      setCode(j.code);
      setHist((h) => [(name ? name + ": " : "") + j.code, ...h]);
    } catch (e: any) {
      setErr("Error: " + (e?.message || e));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#070B14", color: "#EAF1FB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ background: "#121C30", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 32, maxWidth: 460, width: "100%" }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}><b style={{ color: "#00D4FF" }}>Q</b>Trader · Admin</h1>
        <p style={{ color: "#8194B2", fontSize: 13, marginBottom: 18 }}>Generador de códigos (privado)</p>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Clave de admin" type="password"
          style={inp} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente (opcional)"
          style={{ ...inp, marginTop: 10 }} />
        <button onClick={gen} style={btn}>Generar código</button>
        {err && <p style={{ color: "#FF5470", fontSize: 13, marginTop: 10 }}>{err}</p>}
        {code && (
          <div style={{ marginTop: 18, fontFamily: "monospace", fontSize: 24, letterSpacing: 2, color: "#FFD700", background: "rgba(255,215,0,.07)", border: "1px dashed rgba(255,215,0,.3)", borderRadius: 12, padding: 16, textAlign: "center" }}>
            {code}
          </div>
        )}
        {hist.length > 0 && (
          <div style={{ marginTop: 18, fontSize: 12, color: "#8194B2", maxHeight: 160, overflow: "auto" }}>
            {hist.map((h, i) => <div key={i} style={{ fontFamily: "monospace", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>{h}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
const inp: React.CSSProperties = { width: "100%", background: "#070B14", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#EAF1FB", padding: 12, fontSize: 14 };
const btn: React.CSSProperties = { width: "100%", marginTop: 16, border: "none", borderRadius: 11, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#FFD700,#FFB800)", color: "#1a1300" };
