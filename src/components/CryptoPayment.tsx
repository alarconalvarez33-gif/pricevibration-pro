'use client';

import { useState } from 'react';

interface CryptoPaymentProps {
  productName: string;
  priceGs?: string;
  priceUsd?: string;
}

const ADDRESS = 'TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL';

export default function CryptoPayment({ productName, priceGs, priceUsd }: CryptoPaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waText = encodeURIComponent(
    `Hola, realicé un pago crypto por el producto "${productName}" y adjunto el comprobante`
  );
  const waHref = `https://wa.me/trader2?text=${waText}`;

  return (
    <div className="w-full rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-6 md:p-8">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-4">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" />
          </svg>
          CRYPTO
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
          Podés pagar con cripto
        </h3>
        <p className="text-sm text-gray-400">You can also pay with crypto</p>
      </div>

      {/* Product + price */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
        <div>
          <p className="text-white font-semibold text-sm">{productName}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sacred Levels</p>
        </div>
        {(priceGs || priceUsd) && (
          <div className="text-right">
            {priceGs && <p className="text-amber-400 font-bold text-sm font-mono">Gs. {priceGs}</p>}
            {priceUsd && <p className="text-gray-400 text-xs font-mono">≈ ${priceUsd} USD</p>}
          </div>
        )}
      </div>

      {/* Network + address */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Red / Network:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            TRC-20 (Tron)
          </span>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-2">
            Dirección / Address:
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-cyan-400 break-all select-all">
              {ADDRESS}
            </div>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-semibold text-xs transition-all ${
                copied
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
              }`}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-amber-400 font-semibold">Importante:</span> Enviá USDT por la red TRC-20 (Tron).
          Después del pago, mandá el comprobante por WhatsApp para activar tu acceso en menos de 1 hora.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed mt-2">
          <span className="text-amber-400/70 font-semibold">Important:</span> Send USDT via TRC-20 (Tron) network.
          After payment, send the receipt via WhatsApp to activate your access within 1 hour.
        </p>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all"
      >
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.54-1.472A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.01l-.435-.327-2.927.949.974-2.883-.36-.467A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
        Enviar comprobante por WhatsApp
      </a>
    </div>
  );
}
