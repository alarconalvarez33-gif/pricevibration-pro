"use client";
import { useState, useMemo } from "react";

/* ====== EDITABLE: precios, pago, contacto ====== */
const PRICES = { pyg: "Gs. 180.000", usdt: "25" }; // editá el monto USDT
const USDT_ADDR = "TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL"; // tu billetera Binance TRC-20
const USDT_NET = "TRC-20 (Tron)";
const CONTACT = "https://wa.me/595981234128"; // tu WhatsApp para enviar comprobante
const LOGO = "https://www.sacredlevels.com/logonuevos.png";
const AFF = "https://one.exnesstrack.org/a/xwx0gc598n";

/* ====== Activos ====== */
const ASSETS: Record<string, { sym: string; name: string; ref: number }[]> = {
  "Acciones": [
    { sym: "SPCX", name: "SpaceX", ref: 180 }, { sym: "AAPL", name: "Apple", ref: 215 },
    { sym: "NVDA", name: "Nvidia", ref: 120 }, { sym: "TSLA", name: "Tesla", ref: 250 },
    { sym: "MSFT", name: "Microsoft", ref: 440 }, { sym: "AMZN", name: "Amazon", ref: 185 },
    { sym: "GOOGL", name: "Alphabet", ref: 175 }, { sym: "META", name: "Meta", ref: 500 },
  ],
  "Indices": [
    { sym: "US30", name: "Dow Jones", ref: 39000 }, { sym: "NAS100", name: "Nasdaq 100", ref: 18200 },
    { sym: "SPX500", name: "S&P 500", ref: 5200 }, { sym: "GER40", name: "DAX", ref: 18400 },
    { sym: "UK100", name: "FTSE 100", ref: 8150 }, { sym: "JP225", name: "Nikkei", ref: 38900 },
  ],
  "Cripto": [
    { sym: "BTC/USD", name: "Bitcoin", ref: 63250 }, { sym: "ETH/USD", name: "Ethereum", ref: 3420 },
    { sym: "SOL/USD", name: "Solana", ref: 148 }, { sym: "XRP/USD", name: "XRP", ref: 0.52 },
    { sym: "BNB/USD", name: "BNB", ref: 585 }, { sym: "DOGE/USD", name: "Dogecoin", ref: 0.16 },
  ],
  "Forex y Metales": [
    { sym: "XAU/USD", name: "Oro", ref: 2418 }, { sym: "XAG/USD", name: "Plata", ref: 30.8 },
    { sym: "EUR/USD", name: "Euro/Dólar", ref: 1.085 }, { sym: "GBP/USD", name: "Libra/Dólar", ref: 1.27 },
    { sym: "USD/JPY", name: "Dólar/Yen", ref: 157.2 }, { sym: "GBP/JPY", name: "Libra/Yen", ref: 198.4 },
  ],
  "Materias primas": [
    { sym: "WTI", name: "Petróleo WTI", ref: 78 }, { sym: "BRENT", name: "Petróleo Brent", ref: 82 },
  ],
};

/* ====== i18n ES / EN / HI ====== */
const STR: Record<string, any> = {
  es: {
    name: "QTrader", tagline: "Niveles algorítmicos multi-temporalidad",
    g_title: "Activar QTrader", g_desc: "Pegá el código que recibiste al comprar.", activate: "Activar",
    no_code: "No tengo código — comprar", bad: "Código inválido o incompleto.", open: "Abrir cuenta en Exness",
    cat: "Categoría", asset: "Activo", custom: "Personalizado", cname: "Nombre", price: "Precio actual",
    calc: "Calcular", tf: "Horizonte", res: "Resistencias", sup: "Soportes", pivot: "Precio / Pivote",
    nr: "Resistencia cercana", ns: "Soporte cercano", pos: "Posición", rr: "Riesgo / Beneficio",
    near_s: "Cerca de soporte", near_r: "Cerca de resistencia", neutral: "En el medio",
    enter: "Ingresá un precio válido.",
    sizer: "Calculadora de posición", balance: "Capital de la cuenta", riskp: "Riesgo %", stopd: "Distancia al stop",
    risk_amt: "Monto en riesgo", units: "Tamaño sugerido", conf: "Confluencia multi-temporal",
    pay_title: "Comprar QTrader", pay_desc: "Pago único con USDT por Binance. Acceso de por vida.",
    pay_pyg: "Paraguay", pay_intl: "Internacional", pay_steps: "Cómo pagar",
    s1: "Enviá USDT a la dirección de abajo por la red", s2: "Sacá captura del comprobante",
    s3: "Enviánoslo y te devolvemos tu código de activación", copy: "Copiar dirección", copied: "¡Copiada!",
    contact_btn: "Enviar comprobante", back: "Volver",
    disc: "Herramienta de análisis con fines educativos. Los niveles son cálculo matemático, no una predicción ni asesoramiento financiero. Operar conlleva riesgo de pérdida.",
    tfs: [["scalp", "Scalping", 0.5], ["intraday", "Intradía", 1], ["swing", "Swing", 2], ["position", "Posición", 3.5]],
  },
  en: {
    name: "QTrader", tagline: "Multi-timeframe algorithmic levels",
    g_title: "Activate QTrader", g_desc: "Paste the code you received.", activate: "Activate",
    no_code: "No code — buy now", bad: "Invalid or incomplete code.", open: "Open Exness account",
    cat: "Category", asset: "Asset", custom: "Custom", cname: "Name", price: "Current price",
    calc: "Calculate", tf: "Horizon", res: "Resistance", sup: "Support", pivot: "Price / Pivot",
    nr: "Nearest resistance", ns: "Nearest support", pos: "Position", rr: "Risk / Reward",
    near_s: "Near support", near_r: "Near resistance", neutral: "In the middle",
    enter: "Enter a valid price.",
    sizer: "Position size calculator", balance: "Account balance", riskp: "Risk %", stopd: "Stop distance",
    risk_amt: "Risk amount", units: "Suggested size", conf: "Multi-timeframe confluence",
    pay_title: "Buy QTrader", pay_desc: "One-time payment with USDT via Binance. Lifetime access.",
    pay_pyg: "Paraguay", pay_intl: "International", pay_steps: "How to pay",
    s1: "Send USDT to the address below on network", s2: "Take a screenshot of the receipt",
    s3: "Send it to us and we return your activation code", copy: "Copy address", copied: "Copied!",
    contact_btn: "Send receipt", back: "Back",
    disc: "Educational analysis tool. Levels are a mathematical calculation, not a prediction or financial advice. Trading involves risk of loss.",
    tfs: [["scalp", "Scalping", 0.5], ["intraday", "Intraday", 1], ["swing", "Swing", 2], ["position", "Position", 3.5]],
  },
  hi: {
    name: "QTrader", tagline: "मल्टी-टाइमफ्रेम एल्गोरिद्मिक स्तर",
    g_title: "QTrader सक्रिय करें", g_desc: "खरीदते समय प्राप्त कोड पेस्ट करें।", activate: "सक्रिय करें",
    no_code: "कोड नहीं है — अभी खरीदें", bad: "अमान्य या अधूरा कोड।", open: "Exness खाता खोलें",
    cat: "श्रेणी", asset: "संपत्ति", custom: "कस्टम", cname: "नाम", price: "वर्तमान मूल्य",
    calc: "गणना करें", tf: "समय सीमा", res: "प्रतिरोध", sup: "समर्थन", pivot: "मूल्य / पिवट",
    nr: "निकटतम प्रतिरोध", ns: "निकटतम समर्थन", pos: "स्थिति", rr: "जोखिम / लाभ",
    near_s: "समर्थन के पास", near_r: "प्रतिरोध के पास", neutral: "बीच में",
    enter: "मान्य मूल्य दर्ज करें।",
    sizer: "पोजीशन साइज़ कैलकुलेटर", balance: "खाता शेष", riskp: "जोखिम %", stopd: "स्टॉप दूरी",
    risk_amt: "जोखिम राशि", units: "सुझाया गया आकार", conf: "मल्टी-टाइमफ्रेम संगम",
    pay_title: "QTrader खरीदें", pay_desc: "Binance के माध्यम से USDT से एकमुश्त भुगतान। आजीवन पहुँच।",
    pay_pyg: "पैराग्वे", pay_intl: "अंतरराष्ट्रीय", pay_steps: "भुगतान कैसे करें",
    s1: "नीचे दिए पते पर इस नेटवर्क से USDT भेजें", s2: "रसीद का स्क्रीनशॉट लें",
    s3: "हमें भेजें और हम आपका सक्रियण कोड लौटाएंगे", copy: "पता कॉपी करें", copied: "कॉपी हो गया!",
    contact_btn: "रसीद भेजें", back: "वापस",
    disc: "शैक्षिक विश्लेषण उपकरण। स्तर एक गणितीय गणना हैं, भविष्यवाणी या वित्तीय सलाह नहीं। ट्रेडिंग में हानि का जोखिम है।",
    tfs: [["scalp", "Scalping", 0.5], ["intraday", "Intraday", 1], ["swing", "Swing", 2], ["position", "Position", 3.5]],
  },
};

/* ====== Motor de cálculo ====== */
function dec(p: number) { return p >= 1000 ? 1 : p >= 1 ? 2 : 5; }
function rnd(v: number, p: number) { return +v.toFixed(dec(p)); }
function sf(p: number) { let s = 1; while (p < 100) { p *= 10; s *= 10; } while (p >= 1000) { p /= 10; s /= 10; } return s; }
const ANG = [{ d: 45, i: .125 }, { d: 90, i: .25 }, { d: 135, i: .375 }, { d: 180, i: .5 }, { d: 270, i: .75 }, { d: 360, i: 1 }];
function levels(price: number, mult: number) {
  const s = sf(price), root = Math.sqrt(price * s), back = (v: number) => v / s;
  return {
    pivot: rnd(price, price),
    resistance: ANG.map(a => ({ label: a.d + "°", value: rnd(back(Math.pow(root + a.i * mult, 2)), price) })),
    support: ANG.map(a => ({ label: a.d + "°", value: rnd(back(Math.pow(Math.max(root - a.i * mult, 0), 2)), price) })),
  };
}
function read(price: number, mult: number) {
  const lv = levels(price, mult);
  const R = lv.resistance.map(r => r.value).filter(v => v > price).sort((a, b) => a - b);
  const S = lv.support.map(x => x.value).filter(v => v < price).sort((a, b) => b - a);
  const nr = R[0] ?? null, ns = S[0] ?? null;
  const pct = (a: number, b: number) => +(((a - b) / b) * 100).toFixed(2);
  const dr = nr ? pct(nr, price) : null, ds = ns ? pct(price, ns) : null;
  let rr: number | null = null, pos = 50;
  if (nr && ns) { const rw = nr - price, rk = price - ns; if (rk > 0) rr = +(rw / rk).toFixed(2); pos = Math.max(2, Math.min(98, ((price - ns) / (nr - ns)) * 100)); }
  return { nr, ns, dr, ds, rr, pos };
}
function fmt(v: number | null) { if (v == null) return "—"; return v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 1 }) : v >= 1 ? v.toFixed(2) : v.toFixed(5); }

export default function QTrader() {
  const [lang, setLang] = useState("es");
  const [view, setView] = useState<"gate" | "pay" | "app">("gate");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const [cat, setCat] = useState("Acciones");
  const [sym, setSym] = useState("SPCX");
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState("180");
  const [tf, setTf] = useState("intraday");
  const [calcErr, setCalcErr] = useState("");
  const [result, setResult] = useState<any>(null);

  const [balance, setBalance] = useState("");
  const [riskPct, setRiskPct] = useState("1");
  const [stopDist, setStopDist] = useState("");

  const t = STR[lang];
  const mult = (t.tfs.find((x: any) => x[0] === tf) || [, , 1])[2];

  async function activate() {
    setErr("");
    try {
      const r = await fetch("/api/qtrader/activate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await r.json();
      if (j.valid) setView("app"); else setErr(j.reason || t.bad);
    } catch (e: any) { setErr("Error: " + (e?.message || e)); }
  }

  function pickAsset(c: string, s: string) {
    setCat(c); setSym(s);
    const found = ASSETS[c]?.find(a => a.sym === s);
    if (found) setPrice(String(found.ref));
  }

  function calculate() {
    setCalcErr("");
    const p = parseFloat(price);
    if (!p || p <= 0) { setCalcErr(t.enter); return; }
    const name = cat === "__c" ? (customName || "Custom") : sym;
    const rd = read(p, mult);
    const lv = levels(p, mult);
    const conf = t.tfs.map((x: any) => ({ label: x[1], pos: read(p, x[2]).pos }));
    setResult({ name, p, rd, lv, conf });
  }

  const sizer = useMemo(() => {
    const b = parseFloat(balance), rp = parseFloat(riskPct), sd = parseFloat(stopDist);
    if (!b || !rp || !sd || sd <= 0) return null;
    const riskAmt = b * (rp / 100);
    return { riskAmt: +riskAmt.toFixed(2), units: +(riskAmt / sd).toFixed(2) };
  }, [balance, riskPct, stopDist]);

  return (
    <div className="qt">
      <style jsx global>{css}</style>
      <div className="bg-grid" />
      <header>
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          <div><b>Q</b>Trader<small>{t.tagline}</small></div>
        </div>
        <div className="top-actions">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="es">ES</option><option value="en">EN</option><option value="hi">हि</option>
          </select>
          <a className="btn gold" href={AFF} target="_blank" rel="noreferrer">{t.open}</a>
        </div>
      </header>

      {view === "gate" && (
        <div className="gate"><div className="gate-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          <h2>{t.g_title}</h2>
          <p className="muted">{t.g_desc}</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="QTR-XXXX-XXXX-XXXX"
            onKeyDown={(e) => { if (e.key === "Enter") activate(); }} />
          <div className="err">{err}</div>
          <button className="btn cyan wide" onClick={activate}>{t.activate}</button>
          <button className="btn ghost wide" onClick={() => setView("pay")}>{t.no_code}</button>
        </div></div>
      )}

      {view === "pay" && (
        <div className="gate"><div className="gate-card pay">
          <h2>{t.pay_title}</h2>
          <p className="muted">{t.pay_desc}</p>
          <div className="prices">
            <div><small>{t.pay_pyg}</small><b>{PRICES.pyg}</b></div>
            <div><small>{t.pay_intl}</small><b>{PRICES.usdt} USDT</b></div>
          </div>
          <h4 className="steps-h">{t.pay_steps}</h4>
          <ol className="steps">
            <li>{t.s1} <b>{USDT_NET}</b></li>
            <li>{t.s2}</li>
            <li>{t.s3}</li>
          </ol>
          <div className="addr">
            <code>{USDT_ADDR}</code>
            <button className="btn cyan sm" onClick={() => { navigator.clipboard?.writeText(USDT_ADDR); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <a className="btn gold wide" href={CONTACT} target="_blank" rel="noreferrer">{t.contact_btn}</a>
          <button className="btn ghost wide" onClick={() => setView("gate")}>{t.back}</button>
        </div></div>
      )}

      {view === "app" && (
        <main>
          <div className="controls">
            <label><span>{t.cat}</span>
              <select value={cat} onChange={(e) => { const c = e.target.value; setCat(c); if (c !== "__c") { const f = ASSETS[c][0]; setSym(f.sym); setPrice(String(f.ref)); } }}>
                {Object.keys(ASSETS).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__c">{t.custom}</option>
              </select>
            </label>
            {cat === "__c" ? (
              <label><span>{t.cname}</span><input value={customName} onChange={(e) => setCustomName(e.target.value)} /></label>
            ) : (
              <label><span>{t.asset}</span>
                <select value={sym} onChange={(e) => pickAsset(cat, e.target.value)}>
                  {ASSETS[cat].map(a => <option key={a.sym} value={a.sym}>{a.sym} — {a.name}</option>)}
                </select>
              </label>
            )}
            <label><span>{t.price}</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
            <button className="btn cyan" onClick={calculate}>{t.calc}</button>
          </div>

          <div className="tf-row"><span className="tf-label">{t.tf}:</span>
            {t.tfs.map((x: any) => (
              <button key={x[0]} className={"tf" + (tf === x[0] ? " on" : "")} onClick={() => { setTf(x[0]); }}>{x[1]}</button>
            ))}
          </div>
          {calcErr && <p className="err" style={{ padding: "0 20px" }}>{calcErr}</p>}

          {result && (
            <div className="results">
              <div className="gauge-wrap">
                <div className="gauge-head"><span className="asset">{result.name}</span><span className="px">{fmt(result.p)}</span></div>
                <div className="gauge"><div className="mk" style={{ left: result.rd.pos + "%" }} data-px={fmt(result.p)} /></div>
                <div className="gauge-ends">
                  <div className="s">{fmt(result.rd.ns)}<small>{t.sup}</small></div>
                  <div className="r" style={{ textAlign: "right" }}>{fmt(result.rd.nr)}<small>{t.res}</small></div>
                </div>
              </div>

              <div className="read-grid">
                <div className="rcard"><small>{t.nr}</small><b className="down">{fmt(result.rd.nr)} <em>(+{result.rd.dr ?? "—"}%)</em></b></div>
                <div className="rcard"><small>{t.ns}</small><b className="up">{fmt(result.rd.ns)} <em>(-{result.rd.ds ?? "—"}%)</em></b></div>
                <div className="rcard"><small>{t.pos}</small><b>{result.rd.pos < 40 ? t.near_s : result.rd.pos > 60 ? t.near_r : t.neutral}</b></div>
                <div className="rcard"><small>{t.rr}</small><b>{result.rd.rr != null ? result.rd.rr + " : 1" : "—"}</b></div>
              </div>

              <div className="conf">
                <h4>{t.conf}</h4>
                <div className="conf-row">
                  {result.conf.map((c: any, i: number) => (
                    <div key={i} className="conf-chip">
                      <small>{c.label}</small>
                      <div className="mini"><i style={{ width: c.pos + "%" }} /></div>
                      <b>{c.pos < 40 ? t.near_s : c.pos > 60 ? t.near_r : t.neutral}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ladder">
                <div className="lad-col res"><h4>{t.res}</h4>
                  {result.lv.resistance.slice().reverse().map((l: any, i: number) => <div key={i} className="lvl"><span className="ang">{l.label}</span><b>{fmt(l.value)}</b></div>)}
                </div>
                <div className="lad-pivot">{t.pivot}: <b>{fmt(result.lv.pivot)}</b></div>
                <div className="lad-col sup"><h4>{t.sup}</h4>
                  {result.lv.support.map((l: any, i: number) => <div key={i} className="lvl"><span className="ang">{l.label}</span><b>{fmt(l.value)}</b></div>)}
                </div>
              </div>

              <div className="sizer">
                <h4>{t.sizer}</h4>
                <div className="sizer-grid">
                  <label><span>{t.balance}</span><input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="1000" /></label>
                  <label><span>{t.riskp}</span><input type="number" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} /></label>
                  <label><span>{t.stopd}</span><input type="number" value={stopDist} onChange={(e) => setStopDist(e.target.value)} placeholder="12.5" /></label>
                </div>
                {sizer && (
                  <div className="sizer-out">
                    <div><small>{t.risk_amt}</small><b className="up">{sizer.riskAmt}</b></div>
                    <div><small>{t.units}</small><b className="cyan-t">{sizer.units}</b></div>
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="disclaimer">{t.disc}</p>
        </main>
      )}
    </div>
  );
}

const css = `
.qt{--cyan:#00D4FF;--cyan-dk:#0EA5E9;--gold:#FFD700;--bg:#070B14;--bg2:#0C1322;--panel:#121C30;--line:rgba(255,255,255,.08);--text:#EAF1FB;--muted:#8194B2;--up:#26D17C;--down:#FF5470;--mono:'Consolas','SF Mono',monospace;background:var(--bg);color:var(--text);min-height:100vh;font-family:'Segoe UI',system-ui,sans-serif;position:relative}
.qt *{box-sizing:border-box}
.qt .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:46px 46px;pointer-events:none;mask-image:radial-gradient(circle at 50% 25%,#000,transparent 75%)}
.qt header{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 20px;border-bottom:1px solid var(--line);background:rgba(7,11,20,.82);backdrop-filter:blur(14px)}
.qt .brand{display:flex;align-items:center;gap:11px;font-weight:800;font-size:18px}.qt .brand img{height:30px}.qt .brand b{color:var(--cyan)}
.qt .brand small{display:block;color:var(--muted);font-weight:400;font-size:11px}
.qt .top-actions{display:flex;gap:10px;align-items:center}
.qt select{background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:8px 9px;font-family:inherit}
.qt .btn{font-weight:600;border:none;border-radius:10px;cursor:pointer;transition:.18s;padding:11px 18px;font-size:14px;font-family:inherit;text-decoration:none;display:inline-block;text-align:center}
.qt .btn.gold{background:linear-gradient(135deg,var(--gold),#FFB800);color:#1a1300}
.qt .btn.cyan{background:linear-gradient(135deg,var(--cyan),var(--cyan-dk));color:#001018}
.qt .btn.ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
.qt .btn.wide{width:100%;padding:14px;margin-top:10px}.qt .btn.sm{padding:8px 12px;font-size:12px}
.qt .muted{color:var(--muted)}.qt .up{color:var(--up)}.qt .down{color:var(--down)}.qt .cyan-t{color:var(--cyan)}
.qt .err{color:var(--down);font-size:13px;min-height:18px;margin:8px 0;font-weight:500}
.qt .gate{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 60px);padding:24px}
.qt .gate-card{background:linear-gradient(160deg,var(--panel),var(--bg2));border:1px solid var(--line);border-radius:20px;padding:34px;max-width:430px;width:100%;text-align:center;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.qt .gate-card.pay{max-width:480px;text-align:left}
.qt .gate-card img{height:48px;margin-bottom:16px}.qt .gate-card h2{font-size:22px;margin-bottom:6px}
.qt .gate-card input{width:100%;margin-top:18px;background:var(--bg);border:1px solid var(--line);border-radius:12px;color:var(--text);padding:15px;font-family:var(--mono);font-size:20px;text-align:center;letter-spacing:2px;text-transform:uppercase}
.qt .gate-card input:focus{outline:none;border-color:var(--cyan)}
.qt .prices{display:flex;gap:12px;margin:18px 0}
.qt .prices div{flex:1;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center}
.qt .prices small{display:block;color:var(--muted);font-size:12px;margin-bottom:4px}.qt .prices b{font-size:18px;color:var(--gold)}
.qt .steps-h{margin:8px 0;font-size:13px;color:var(--cyan);text-transform:uppercase;letter-spacing:.5px}
.qt .steps{margin:0 0 14px 18px;color:var(--text);font-size:14px;line-height:1.7}
.qt .addr{display:flex;gap:10px;align-items:center;background:var(--bg);border:1px dashed rgba(255,215,0,.3);border-radius:10px;padding:12px;margin-bottom:8px;flex-wrap:wrap}
.qt .addr code{font-family:var(--mono);font-size:12px;color:var(--gold);word-break:break-all;flex:1;min-width:180px}
.qt main{position:relative;z-index:1}
.qt .controls{padding:22px 20px 8px;display:grid;grid-template-columns:1fr 1.4fr 1fr auto;gap:12px;align-items:end}
.qt .controls label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--muted)}
.qt .controls select,.qt .controls input{background:var(--panel);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:12px;font-size:14px;font-family:inherit}
.qt .controls input{font-family:var(--mono)}.qt .controls .btn{height:46px}
.qt .tf-row{padding:4px 20px 6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.qt .tf-label{font-size:12px;color:var(--muted)}
.qt .tf{background:var(--panel);border:1px solid var(--line);color:var(--muted);border-radius:99px;padding:8px 15px;font-size:13px;font-weight:600;cursor:pointer}
.qt .tf.on{background:linear-gradient(135deg,var(--cyan),var(--cyan-dk));color:#001018;border-color:transparent}
.qt .results{padding:14px 20px 10px;animation:fade .5s}
@keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.qt .gauge-wrap{background:linear-gradient(160deg,var(--panel),var(--bg2));border:1px solid var(--line);border-radius:18px;padding:22px;margin-bottom:16px}
.qt .gauge-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px}
.qt .gauge-head .asset{font-size:20px;font-weight:800}.qt .gauge-head .px{font-family:var(--mono);font-size:24px;color:var(--gold)}
.qt .gauge{position:relative;height:14px;border-radius:99px;background:linear-gradient(90deg,rgba(38,209,124,.5),rgba(255,215,0,.4),rgba(255,84,112,.5));margin:30px 0 8px}
.qt .gauge .mk{position:absolute;top:50%;width:4px;height:30px;background:#fff;border-radius:3px;transform:translate(-50%,-50%);box-shadow:0 0 14px rgba(255,255,255,.9);transition:left 1s cubic-bezier(.22,1,.36,1)}
.qt .gauge .mk::after{content:attr(data-px);position:absolute;top:-26px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:12px;background:#fff;color:#001018;padding:2px 7px;border-radius:5px;font-weight:700;white-space:nowrap}
.qt .gauge-ends{display:flex;justify-content:space-between;font-family:var(--mono);font-size:13px}
.qt .gauge-ends .s{color:var(--up)}.qt .gauge-ends .r{color:var(--down)}.qt .gauge-ends small{display:block;color:var(--muted);font-size:11px;font-family:'Segoe UI'}
.qt .read-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.qt .rcard{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:14px}
.qt .rcard small{display:block;color:var(--muted);font-size:11px;margin-bottom:5px}.qt .rcard b{font-family:var(--mono);font-size:16px}.qt .rcard em{font-style:normal;font-size:12px;opacity:.85}
.qt .conf{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px}
.qt .conf>h4,.qt .sizer>h4{font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:var(--cyan);margin-bottom:12px}
.qt .conf-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.qt .conf-chip{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;text-align:center}
.qt .conf-chip small{display:block;color:var(--muted);font-size:11px;margin-bottom:6px}
.qt .conf-chip .mini{height:5px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-bottom:6px}
.qt .conf-chip .mini i{display:block;height:100%;background:linear-gradient(90deg,var(--up),var(--gold),var(--down))}
.qt .conf-chip b{font-size:11px}
.qt .ladder{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:linear-gradient(160deg,var(--panel),var(--bg2));border:1px solid var(--line);border-radius:16px;padding:18px;margin-bottom:16px}
.qt .lad-col h4{font-size:12px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:9px}
.qt .lad-col.res h4{color:var(--down)}.qt .lad-col.sup h4{color:var(--up)}
.qt .lad-pivot{grid-column:1/-1;text-align:center;font-family:var(--mono);color:var(--gold);background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.22);border-radius:10px;padding:9px;font-size:15px}
.qt .lvl{display:flex;justify-content:space-between;font-family:var(--mono);font-size:13px;padding:8px 10px;border-radius:8px;margin-bottom:5px;background:rgba(255,255,255,.025);border:1px solid var(--line)}
.qt .lvl .ang{color:var(--muted)}.qt .lad-col.res .lvl b{color:var(--down)}.qt .lad-col.sup .lvl b{color:var(--up)}
.qt .sizer{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}
.qt .sizer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.qt .sizer-grid label{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--muted)}
.qt .sizer-grid input{background:var(--bg);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:11px;font-family:var(--mono)}
.qt .sizer-out{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.qt .sizer-out div{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:12px}
.qt .sizer-out small{display:block;color:var(--muted);font-size:11px;margin-bottom:4px}.qt .sizer-out b{font-family:var(--mono);font-size:18px}
.qt .disclaimer{font-size:11px;color:var(--muted);padding:18px 20px 34px;line-height:1.5;opacity:.85;border-top:1px solid var(--line);margin-top:12px}
@media(max-width:760px){.qt .controls{grid-template-columns:1fr 1fr}.qt .controls .btn{grid-column:1/-1}.qt .read-grid,.qt .conf-row{grid-template-columns:1fr 1fr}.qt .sizer-grid{grid-template-columns:1fr}}
`;
