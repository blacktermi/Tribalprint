import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const WAVE_URL = 'https://pay.wave.com/m/M_K2JzSem1eAKX/c/ci/'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function formatFcfa(n?: string | null) {
  if (!n) return null
  const v = Number(n)
  if (Number.isNaN(v)) return null
  return v.toLocaleString() + ' FCFA'
}

export default function ConfirmationPage() {
  // Logo Wave: essayer PNG fourni, sinon fallback vers SVG interne, sinon emoji
  const logoSources = ['/img/Logowave.png', '/img/logowave.png', '/img/wave-logo.svg'] as const
  const [logoIdx, setLogoIdx] = useState(0)
  const [emojiFallback, setEmojiFallback] = useState(false)
  const q = useQuery()
  const name = q.get('name') || ''
  const phone = q.get('phone') || ''
  const product = q.get('product') || ''
  const totalStr = q.get('total')
  const subtotalStr = q.get('subtotal')
  const deliveryStr = q.get('delivery')
  const deliveryDate = q.get('delivery_date')
  const deliveryWindow = q.get('delivery_window')
  const commune = q.get('commune') || ''

  const total = totalStr ? Number(totalStr) : undefined
  const acompte = total && total > 20000 ? Math.round(total * 0.3) : undefined

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Confirmation</h1>
        <p className="text-slate-600 mt-1">
          {name ? `Merci ${name}, votre demande a bien été envoyée.` : 'Merci, votre demande a bien été envoyée.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Récapitulatif */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium mb-3">Récapitulatif</div>
          <div className="space-y-2 text-sm text-slate-700">
            {product && (
              <div className="flex justify-between"><span>Produit</span><span className="font-medium">{product}</span></div>
            )}
            {subtotalStr && (
              <div className="flex justify-between"><span>Sous-total</span><span className="font-medium">{formatFcfa(subtotalStr)}</span></div>
            )}
            {deliveryStr && (
              <div className="flex justify-between"><span>Livraison</span><span className="font-medium">{formatFcfa(deliveryStr)}</span></div>
            )}
            {typeof total !== 'undefined' && (
              <div className="flex justify-between border-t pt-2"><span className="font-medium">Total</span><span className="font-semibold text-slate-900">{formatFcfa(String(total))}</span></div>
            )}
            {(deliveryDate || deliveryWindow) && (
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryDate}</strong>{deliveryWindow ? ` • ${deliveryWindow}` : ''}</span></div>
            )}
            {commune && (
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
            )}
            {phone && (
              <div className="flex justify-between text-slate-600"><span>Téléphone</span><span>{phone}</span></div>
            )}
          </div>
        </div>

        {/* Paiement Wave */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium mb-2">Paiement</div>
          <p className="text-sm text-slate-600">Le paiement n’est pas obligatoire maintenant — vous pouvez aussi payer à la livraison.</p>
          <p className="text-xs text-slate-500 mb-3">Si vous payez avec Wave, indiquez le montant souhaité dans l’app Wave.</p>

          <div className="flex flex-wrap gap-2">
            {typeof acompte !== 'undefined' && (
              <a
                href={WAVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-medium shadow"
                title={`Payer l’acompte de ${acompte.toLocaleString()} FCFA`}
              >
                {!emojiFallback ? (
                  <img
                    src={logoSources[logoIdx]}
                    alt="Wave"
                    className="h-5 w-auto"
                    onError={() => {
                      if (logoIdx < logoSources.length - 1) setLogoIdx(i => i + 1); else setEmojiFallback(true)
                    }}
                  />
                ) : (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/15">👋</span>
                )}
                <span>Payer l’acompte · {acompte.toLocaleString()} FCFA</span>
              </a>
            )}

            {typeof total !== 'undefined' && (
              <a
                href={WAVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-sm font-medium shadow"
                title={`Payer le total de ${total.toLocaleString()} FCFA`}
              >
                {!emojiFallback ? (
                  <img
                    src={logoSources[logoIdx]}
                    alt="Wave"
                    className="h-5 w-auto"
                    onError={() => {
                      if (logoIdx < logoSources.length - 1) setLogoIdx(i => i + 1); else setEmojiFallback(true)
                    }}
                  />
                ) : (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/15">👋</span>
                )}
                <span>Payer le total · {total.toLocaleString()} FCFA</span>
              </a>
            )}
          </div>

          {typeof acompte !== 'undefined' && (
            <div className="mt-3 text-xs text-slate-600">Acompte conseillé: <span className="font-medium text-slate-900">{acompte.toLocaleString()} FCFA</span></div>
          )}

          <div className="mt-4 text-xs text-slate-500">
            Un conseiller vous contactera si besoin pour finaliser les détails et la livraison. Paiement à la livraison accepté.
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-slate-600">
        <div>Service client: +225 07 87 50 26 37</div>
        <Link to="/" className="text-slate-900 hover:underline">Retour à l'accueil</Link>
      </div>
    </div>
  )
}
