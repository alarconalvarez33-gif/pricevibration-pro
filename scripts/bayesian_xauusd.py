#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║   SACRED LEVELS — Motor de Inferencia Bayesiana XAUUSD          ║
║   Matemática del Maestro © 2025                                  ║
║                                                                  ║
║   Arquitectura: Bayes + Monte Carlo (Geometric Brownian Motion)  ║
║   Deps: pip install pandas numpy yfinance                        ║
╚══════════════════════════════════════════════════════════════════╝
"""

import numpy as np
import pandas as pd
import yfinance as yf
import warnings
warnings.filterwarnings('ignore')

# ─── Parámetros globales ───────────────────────────────────────────────────────
TICKER           = "GC=F"     # Gold Futures — proxy de XAUUSD en Yahoo Finance
PROXIMIDAD       = 0.002      # ±0.2 % para considerar que el precio "toca" un nivel
RSI_PERIODO      = 14
RSI_SOBREVENTA   = 30
VOLATILIDAD_ALTA = 0.015      # ATR/Precio > 1.5 % = volatilidad alta
SIMULACIONES     = 1_000
VELAS_FUTURO     = 5

# Mapeo: temporalidad → (intervalo Yahoo, rango histórico)
TEMPORAL_MAP = {
    '1m':  ('1m',  '7d'),
    '5m':  ('5m',  '60d'),
    '15m': ('15m', '60d'),
    '30m': ('30m', '60d'),
    '1h':  ('1h',  '730d'),
    '4h':  ('1h',  '730d'),   # Yahoo no provee 4h nativamente → resampleamos
    '1d':  ('1d',  '5y'),
}


# ─── Indicadores técnicos ──────────────────────────────────────────────────────

def calcular_rsi(close: pd.Series, periodo: int = 14) -> pd.Series:
    """
    RSI de Wilder (suavizado exponencial):
        RS  = EMA_ganancias / EMA_pérdidas
        RSI = 100 - (100 / (1 + RS))
    """
    delta    = close.diff()
    ganancias = delta.clip(lower=0)
    perdidas  = (-delta).clip(lower=0)
    ema_g    = ganancias.ewm(com=periodo - 1, adjust=False).mean()
    ema_p    = perdidas.ewm(com=periodo - 1, adjust=False).mean()
    rs       = ema_g / ema_p
    return 100 - (100 / (1 + rs))


def calcular_atr(df: pd.DataFrame, periodo: int = 14) -> pd.Series:
    """
    Average True Range:
        TR  = max(H-L, |H-C_prev|, |L-C_prev|)
        ATR = EMA(TR, periodo)
    """
    hl  = df['High'] - df['Low']
    hcp = (df['High'] - df['Close'].shift()).abs()
    lcp = (df['Low']  - df['Close'].shift()).abs()
    tr  = pd.concat([hl, hcp, lcp], axis=1).max(axis=1)
    return tr.ewm(com=periodo - 1, adjust=False).mean()


# ─── Descarga de datos ─────────────────────────────────────────────────────────

def obtener_datos(temporalidad: str) -> pd.DataFrame:
    if temporalidad not in TEMPORAL_MAP:
        raise ValueError(f"Temporalidad '{temporalidad}' no soportada. Opciones: {list(TEMPORAL_MAP.keys())}")

    intervalo, rango = TEMPORAL_MAP[temporalidad]
    print(f"\n📡 Descargando {TICKER} | intervalo={intervalo} | rango={rango}...")

    df = yf.download(TICKER, interval=intervalo, period=rango, progress=False)

    if df.empty:
        raise ValueError("No se pudieron obtener datos. Verificá la conexión a internet.")

    # Resample manual a 4h (Yahoo solo provee 1h como máximo intradiario largo)
    if temporalidad == '4h':
        df = df.resample('4h').agg({
            'Open':   'first',
            'High':   'max',
            'Low':    'min',
            'Close':  'last',
            'Volume': 'sum'
        }).dropna()

    # Aplanar MultiIndex si yfinance lo genera
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    print(f"✅ {len(df)} velas descargadas.")
    print(f"   Última vela: {df.index[-1]} | Close: ${float(df['Close'].iloc[-1]):,.2f}")
    return df


# ─── Probabilidades bayesianas ─────────────────────────────────────────────────

def calcular_P_A(df: pd.DataFrame, nivel: float) -> float:
    """
    P(A) — Prior: probabilidad histórica de rebote en el nivel sagrado.

    Método:
      1. Identificamos velas donde el precio "tocó" la zona ±PROXIMIDAD del nivel.
      2. Definimos "rebote exitoso":
         - Toque desde ABAJO → cierre > nivel  (soporte respetado)
         - Toque desde ARRIBA → cierre < nivel (resistencia respetada)
      3. P(A) = rebotes_exitosos / total_toques
    """
    zona_sup = nivel * (1 + PROXIMIDAD)
    zona_inf = nivel * (1 - PROXIMIDAD)

    tocaron = df[(df['Low'] <= zona_sup) & (df['High'] >= zona_inf)]

    if len(tocaron) < 5:
        print(f"⚠️  Pocas interacciones históricas ({len(tocaron)}). Prior conservador aplicado.")
        return 0.55

    rebotes = sum(
        1 for _, r in tocaron.iterrows()
        if (r['Low'] <= zona_sup and float(r['Close']) > nivel) or
           (r['High'] >= zona_inf and float(r['Close']) < nivel)
    )

    p_a = rebotes / len(tocaron)
    print(f"\n📊 P(A) — Respeto histórico del nivel ${nivel:,.2f}:")
    print(f"   Toques: {len(tocaron)} | Rebotes: {rebotes} | P(A) = {p_a:.3f}  ({p_a*100:.1f}%)")
    return p_a


def calcular_condiciones_actuales(df: pd.DataFrame) -> dict:
    """
    Evalúa el estado actual del mercado (condición B):
      - RSI en extremos (sobreventa / sobrecompra)
      - Volatilidad relativa (ATR / precio)
      - Tendencia respecto a EMA 50
    """
    close = df['Close'].squeeze()
    rsi   = calcular_rsi(close, RSI_PERIODO)
    atr   = calcular_atr(df, 14)

    rsi_actual = float(rsi.iloc[-1])
    atr_actual = float(atr.iloc[-1])
    px_actual  = float(close.iloc[-1])
    ema50      = float(close.ewm(span=50, adjust=False).mean().iloc[-1])

    sobreventa  = rsi_actual < RSI_SOBREVENTA
    sobrecompra = rsi_actual > (100 - RSI_SOBREVENTA)
    vol_alta    = (atr_actual / px_actual) > VOLATILIDAD_ALTA
    alc         = px_actual > ema50

    estado_rsi = '⬇ SOBREVENTA' if sobreventa else '⬆ SOBRECOMPRA' if sobrecompra else '↔ NEUTRO'
    print(f"\n📈 Condiciones actuales (B):")
    print(f"   RSI({RSI_PERIODO})  : {rsi_actual:.1f}  {estado_rsi}")
    print(f"   Volatilidad  : {atr_actual/px_actual*100:.2f}%  {'🔥 ALTA' if vol_alta else '😴 NORMAL'}")
    print(f"   Tendencia    : {'↑ ALCISTA' if alc else '↓ BAJISTA'}  (${px_actual:,.2f} vs EMA50 ${ema50:,.2f})")

    return {
        'rsi': rsi_actual, 'sobreventa': sobreventa, 'sobrecompra': sobrecompra,
        'vol_alta': vol_alta, 'tendencia_alc': alc,
        'atr': atr_actual, 'precio': px_actual,
    }


def calcular_P_B_dado_A(df: pd.DataFrame, nivel: float) -> float:
    """
    P(B|A) — Likelihood: probabilidad de observar condiciones extremas
    EN LAS VELAS DONDE HUBO REBOTE EXITOSO.

    Responde: "Cuando el precio rebotó históricamente en este nivel,
               ¿con qué frecuencia el RSI o la volatilidad eran extremos?"
    """
    zona_sup  = nivel * (1 + PROXIMIDAD)
    zona_inf  = nivel * (1 - PROXIMIDAD)
    close     = df['Close'].squeeze()
    rsi_serie = calcular_rsi(close, RSI_PERIODO)
    atr_serie = calcular_atr(df, 14)

    tocaron = df[(df['Low'] <= zona_sup) & (df['High'] >= zona_inf)]
    if len(tocaron) < 5:
        return 0.60

    conteo = 0
    for idx, r in tocaron.iterrows():
        rsi_v = float(rsi_serie.get(idx, 50))
        atr_v = float(atr_serie.get(idx, 0))
        px_v  = float(r['Close'])
        if (rsi_v < RSI_SOBREVENTA or rsi_v > (100 - RSI_SOBREVENTA)) or \
           (px_v > 0 and (atr_v / px_v) > VOLATILIDAD_ALTA):
            conteo += 1

    p = conteo / len(tocaron)
    print(f"\n🔬 P(B|A) — Condiciones extremas en rebotes históricos:")
    print(f"   {conteo}/{len(tocaron)} rebotes con RSI extremo o vol. alta → P(B|A) = {p:.3f}")
    return max(p, 0.01)


def calcular_P_B(df: pd.DataFrame) -> float:
    """
    P(B) — Evidencia marginal: frecuencia de condiciones extremas en TODO el histórico.

    Es el denominador normalizador del teorema de Bayes.
    """
    close     = df['Close'].squeeze()
    rsi_serie = calcular_rsi(close, RSI_PERIODO).dropna()
    atr_serie = calcular_atr(df, 14).dropna()
    idx_comun = rsi_serie.index.intersection(atr_serie.index)
    px_serie  = close.loc[idx_comun]

    cond_rsi = (rsi_serie.loc[idx_comun] < RSI_SOBREVENTA) | \
               (rsi_serie.loc[idx_comun] > (100 - RSI_SOBREVENTA))
    cond_vol = (atr_serie.loc[idx_comun] / px_serie) > VOLATILIDAD_ALTA

    p = (cond_rsi | cond_vol).mean()
    print(f"\n📉 P(B) — Frecuencia de condiciones extremas en histórico: {p:.3f}  ({p*100:.1f}% del tiempo)")
    return max(float(p), 0.01)


def teorema_bayes(p_a: float, p_b_dado_a: float, p_b: float) -> float:
    """
    Teorema de Bayes:

          P(B|A) × P(A)
    P(A|B) = ─────────────
                 P(B)

    Intuitivo: "dado que las condiciones actuales son X,
                ¿cuán probable es que el nivel sea respetado?"
    """
    posterior = (p_b_dado_a * p_a) / p_b
    return min(max(posterior, 0.0), 1.0)


# ─── Simulación de Monte Carlo ─────────────────────────────────────────────────

def monte_carlo(df: pd.DataFrame) -> dict:
    """
    Proyección de precio por Movimiento Browniano Geométrico (GBM):

        P_{t+1} = P_t × exp( (μ - σ²/2)·Δt + σ·√Δt·ε )

    Con Δt = 1 vela, ε ~ N(0,1).

    Pasos:
      1. Calcular retornos log: r_t = ln(P_t / P_{t-1})
      2. Estimar μ y σ empíricos
      3. Simular SIMULACIONES trayectorias de VELAS_FUTURO pasos
      4. Reportar distribución de percentiles del precio final
    """
    close    = df['Close'].squeeze()
    retornos = np.log(close / close.shift(1)).dropna().values

    mu    = retornos.mean()
    sigma = retornos.std()
    P0    = float(close.iloc[-1])

    print(f"\n🎲 Monte Carlo ({SIMULACIONES:,} simulaciones | {VELAS_FUTURO} velas hacia adelante):")
    print(f"   μ = {mu:.6f}  |  σ = {sigma:.6f}  |  P₀ = ${P0:,.2f}")

    # GBM: (N_sim × N_velas) retornos aleatorios
    eps          = np.random.standard_normal((SIMULACIONES, VELAS_FUTURO))
    drift        = (mu - 0.5 * sigma**2)                  # deriva ajustada por Itô
    ret_sim      = drift + sigma * eps                     # retornos simulados por vela
    precios_sim  = P0 * np.exp(np.cumsum(ret_sim, axis=1)) # trayectorias de precios

    final        = precios_sim[:, -1]
    pct          = np.percentile(final, [5, 25, 50, 75, 95])

    return {
        'P0': P0, 'mu': mu, 'sigma': sigma,
        'p5': pct[0], 'p25': pct[1], 'mediana': pct[2], 'p75': pct[3], 'p95': pct[4],
        'trayectorias': precios_sim,
    }


# ─── Reporte ───────────────────────────────────────────────────────────────────

def imprimir_reporte(nivel, temporalidad, cond, p_a, p_b_dado_a, p_b, posterior, mc):
    SEP = "─" * 62
    pct_dist = abs(cond['precio'] - nivel) / nivel * 100
    var_med  = (mc['mediana'] - mc['P0']) / mc['P0'] * 100

    nivel_conf = ("🟢 ALTA"   if posterior > 0.70 else
                  "🟡 MEDIA"  if posterior > 0.50 else
                  "🔴 BAJA")
    barra = "█" * int(posterior * 40) + "░" * (40 - int(posterior * 40))

    print(f"\n{'═'*62}")
    print(f"  🏆  SACRED LEVELS — MOTOR BAYESIANO XAUUSD")
    print(f"{'═'*62}")
    print(f"  Temporalidad   : {temporalidad.upper()}")
    print(f"  Nivel Sagrado  : ${nivel:>12,.2f}")
    print(f"  Precio actual  : ${cond['precio']:>12,.2f}  ({pct_dist:.2f}% del nivel)")
    print(SEP)
    print("  TEOREMA DE BAYES")
    print(SEP)
    print(f"  P(A)         Prior     →  {p_a:.4f}  ({p_a*100:.1f}%)")
    print(f"  P(B|A)       Likelihood→  {p_b_dado_a:.4f}  ({p_b_dado_a*100:.1f}%)")
    print(f"  P(B)         Evidencia →  {p_b:.4f}  ({p_b*100:.1f}%)")
    print(SEP)
    print(f"  P(A|B) POSTERIOR  →  {posterior:.4f}  ({posterior*100:.1f}%)  {nivel_conf}")
    print(f"  [{barra}]")
    print(SEP)
    print(f"  MONTE CARLO — Proyección {VELAS_FUTURO} velas")
    print(SEP)
    print(f"  Pesimista  P5  : ${mc['p5']:>12,.2f}")
    print(f"  Cuartil    P25 : ${mc['p25']:>12,.2f}")
    print(f"  Mediana    P50 : ${mc['mediana']:>12,.2f}  ← centro de gravedad")
    print(f"  Cuartil    P75 : ${mc['p75']:>12,.2f}")
    print(f"  Optimista  P95 : ${mc['p95']:>12,.2f}")
    print(f"  Variación esperada: {var_med:+.2f}%")
    print(SEP)

    if posterior > 0.65:
        dir_ = "ALCISTA 🟢" if cond['tendencia_alc'] else "BAJISTA 🔴"
        print(f"\n  ✅ SEÑAL CONFIRMADA — Rebote probable → {dir_}")
        print(f"     Target P75: ${mc['p75']:,.2f}  |  Stop P5: ${mc['p5']:,.2f}")
    elif posterior > 0.50:
        print("\n  ⚠️  SEÑAL DÉBIL — Esperá confirmación de cierre de vela")
    else:
        print("\n  ❌ NIVEL EN DUDA — Mayor probabilidad de ruptura que de rebote")

    print(f"\n  ⚖️  Solo uso educativo. No constituye asesoramiento financiero.")
    print(f"{'═'*62}\n")


# ─── Entry point ──────────────────────────────────────────────────────────────

def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║   SACRED LEVELS — Motor Bayesiano XAUUSD                    ║")
    print("║   Matemática del Maestro  ©  2025                           ║")
    print("╚══════════════════════════════════════════════════════════════╝\n")

    temporalidad = input("⏱  Temporalidad (1m/5m/15m/30m/1h/4h/1d) [default 1h]: ").strip() or '1h'
    nivel_str    = input("🎯 Nivel Sagrado (precio XAUUSD, ej. 3300.00): ").strip()

    try:
        nivel = float(nivel_str.replace(',', '.'))
        if nivel <= 0:
            raise ValueError
    except ValueError:
        print("❌ Precio inválido. Formato correcto: 3300.00")
        return

    np.random.seed(42)  # Semilla fija → resultados reproducibles

    # ── Pipeline ──
    df         = obtener_datos(temporalidad)
    cond       = calcular_condiciones_actuales(df)
    p_a        = calcular_P_A(df, nivel)
    p_b_dado_a = calcular_P_B_dado_A(df, nivel)
    p_b        = calcular_P_B(df)
    posterior  = teorema_bayes(p_a, p_b_dado_a, p_b)
    mc         = monte_carlo(df)

    imprimir_reporte(nivel, temporalidad, cond, p_a, p_b_dado_a, p_b, posterior, mc)


if __name__ == '__main__':
    main()
