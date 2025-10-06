import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'

type Zone = 1 | 2 | 3
type Kind = 'metal' | 'bois' | 'aluminium' | 'canvas'

const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }
const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: ['Cocody centre','Adjamé','Plateau','Dokui','Yopougon','Gonzague','Port-Bouët','2 Plateaux','Abobo','Riviera',"M'badon",'Bonoumin','Faya','Attoban','Anono','Angré','Abatta'],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

// Formats par catégorie
type FormatOption = { code: string; label: string; size: string; price: number }
const FORMAT_OPTIONS: Record<Kind, FormatOption[]> = {
  // Metal Poster: format unique (exigence métier)
  metal: [
    { code: 'M-A3', label: 'A3 — 29,7 × 42 cm', size: '29,7 × 42 cm', price: 15000 },
  ],
  // Aluminium: aligne sur la page TableauxAluminium (A2/A1/A0)
  aluminium: [
    { code: 'A4', label: 'A4 — 21 × 29,7 cm', size: '21 × 29,7 cm', price: 10000 },
    { code: 'A3', label: 'A3 — 29,7 × 42 cm', size: '29,7 × 42 cm', price: 15000 },
    { code: 'A2', label: 'A2 — 42 × 59,4 cm', size: '42 × 59,4 cm', price: 45000 },
    { code: 'A1', label: 'A1 — 59,4 × 84,1 cm', size: '59,4 × 84,1 cm', price: 65000 },
    { code: 'A0', label: 'A0 — 84,1 × 118,9 cm', size: '84,1 × 118,9 cm', price: 85000 },
  ],
  // Canvas: tarifs alignés avec CanvasPage (A2/A1/A0)
  canvas: [
    { code: 'A2', label: 'A2 — 42 × 59,4 cm', size: '42 × 59,4 cm', price: 50000 },
    { code: 'A1', label: 'A1 — 59,4 × 84,1 cm', size: '59,4 × 84,1 cm', price: 80000 },
    { code: 'A0', label: 'A0 — 84,1 × 118,9 cm', size: '84,1 × 118,9 cm', price: 100000 },
  ],
  // Bois (non utilisé dans la boutique stock actuelle, conservé pour compatibilité)
  bois: [
    { code: 'L', label: 'L — 47 × 63 cm', size: '47 × 63 cm', price: 70000 },
    { code: 'XL', label: 'XL — 63 × 90 cm', size: '63 × 90 cm', price: 95000 },
    { code: 'XXL', label: 'XXL — 85 × 119 cm', size: '85 × 119 cm', price: 130000 },
  ],
}

export default function StockProductPage() {
  const navigate = useNavigate()
  const { kind, id } = useParams<{ kind: Kind; id: string }>()
  const k = (kind as Kind) || 'metal'
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])
  const [qty, setQty] = useState(1)
  const touched = true

  // Sélection de format selon catégorie + id (TB => défaut A2, MT => défaut A1)
  const formatOptions = FORMAT_OPTIONS[k] || []
  const defaultFormatCode = useMemo(() => {
    // Règles claires:
    // - metal: format unique A3
    // - aluminium/canvas: défaut A2 (modifiable par l’utilisateur)
    if (k === 'metal') return formatOptions[0]?.code || ''
    return (formatOptions.find(f => f.code === 'A2')?.code) || formatOptions[0]?.code || ''
  }, [k, formatOptions])
  const [formatCode, setFormatCode] = useState<string>(defaultFormatCode)
  const selectedFormat = useMemo(() => formatOptions.find(f => f.code === formatCode) || formatOptions[0], [formatCode, formatOptions])

  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const price = selectedFormat?.price || 0
  const subtotal = price * qty
  const eligibleDiscount = qty >= 5
  const discountAmount = eligibleDiscount ? Math.round(subtotal * 0.10) : 0
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const phoneValid = useMemo(() => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 15 }, [phone])
  const formValid = useMemo(() => fullName.trim().length > 1 && phoneValid && qty > 0, [fullName, phoneValid, qty])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }
  const label = k === 'metal' ? 'Metal Poster' : (k === 'aluminium' ? 'Tableau Aluminium' : (k === 'canvas' ? 'Toile Canvas' : 'Tableau Bois'))
  const size = selectedFormat?.size || ''

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({ product: `stock-${k}`, ref: id || '', format: selectedFormat?.code || '', zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    params.append('qty', String(qty))
    return `/confirmation?${params.toString()}`
  }, [k, id, formatCode, selectedFormat?.code, zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, deliveryInfo.iso, deliveryInfo.window, qty])

  const handleOrder = () => { if (!formValid) return; navigate(confirmationTo) }

  const imgSrc = `/img/${id}.jpg`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src={imgSrc} alt={label} className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
          <p className="mt-1 text-slate-600 text-sm">Référence: {id} • Taille: {size}. Produit en stock. Remise 10% dès 5 unités, acompte 30% au-delà de 20 000 FCFA.</p>
          <div className="mt-6 space-y-6">
            {/* Format (si plusieurs options) */}
            {formatOptions.length > 1 && (
              <div>
                <div className="text-sm font-medium mb-2">Format</div>
                <div className="flex flex-wrap gap-2">
                  {formatOptions.map(opt => (
                    <button key={opt.code} type="button" onClick={() => setFormatCode(opt.code)} className={`rounded-full border px-3 py-1.5 text-sm ${formatCode === opt.code ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>
                      {opt.label} — {opt.price.toLocaleString()} FCFA
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom et Prénom <span className="text-red-600">*</span></label>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Koffi Kouadio" />
                {touched && fullName.trim().length <= 1 && (<div className="mt-1 text-xs text-red-600">Nom et Prénom requis.</div>)}
              </div>
              <div>
                <label className="text-sm font-medium">Numéro de téléphone <span className="text-red-600">*</span></label>
                <input type="tel" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +225 07 87 50 26 37" />
                {touched && !phoneValid && (<div className="mt-1 text-xs text-red-600">Numéro invalide (8 à 15 chiffres).</div>)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm">Quantité</label>
              <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)}>
                {Array.from({ length: 51 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
              <div className="text-sm text-slate-600">{price.toLocaleString()} FCFA / unité</div>
            </div>

            {/* Livraison */}
            <div>
              <div className="text-sm font-medium mb-2">Zone de livraison</div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((z) => (
                  <button key={z} onClick={() => updateZone(z as Zone)} className={`rounded-lg border px-3 py-2 text-sm text-left ${zone === z ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-300 hover:border-slate-400'}`}>
                    <div className="font-medium">Zone {z}</div>
                    <div className="text-slate-600">{DELIVERY[z as Zone].toLocaleString()} FCFA</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Commune</div>
              <select className="w-full md:w-80 rounded-md border border-slate-300 px-3 py-2 text-sm" value={commune} onChange={(e) => setCommune(e.target.value)}>
                {COMMUNES[zone].map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            {/* Récap */}
            <div className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="mb-2">
                <div className="font-medium mb-1">Produit</div>
                <div className="flex justify-between text-slate-700"><span>{label} {selectedFormat ? `(${selectedFormat.label})` : ''} — Ref {id} × {qty}</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              </div>
              {discountAmount > 0 && (<div className="flex justify-between text-green-700"><span>Remise (10% dès 5 unités)</span><span>-{discountAmount.toLocaleString()} FCFA</span></div>)}
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={handleOrder} disabled={!formValid} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`}>Commander</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
