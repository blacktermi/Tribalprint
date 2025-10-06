import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'

type Zone = 1 | 2 | 3
type Kind = 'metal' | 'bois' | 'aluminium'

const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }
const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: ['Cocody centre','Adjamé','Plateau','Dokui','Yopougon','Gonzague','Port-Bouët','2 Plateaux','Abobo','Riviera',"M'badon",'Bonoumin','Faya','Attoban','Anono','Angré','Abatta'],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

// Prix & formats par type de tableau stock
const PRICING: Record<Kind, { label: string; price: number; size: string }> = {
  metal: { label: 'Metal Poster 32×48 cm', price: 15000, size: '32 × 48 cm' },
  aluminium: { label: 'Tableau Aluminium A2', price: 38000, size: '42 × 60 cm' },
  bois: { label: 'Tableau Bois L', price: 70000, size: '47 × 63 cm' },
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

  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const price = PRICING[k]?.price || 0
  const subtotal = price * qty
  const eligibleDiscount = qty >= 5
  const discountAmount = eligibleDiscount ? Math.round(subtotal * 0.10) : 0
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const phoneValid = useMemo(() => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 15 }, [phone])
  const formValid = useMemo(() => fullName.trim().length > 1 && phoneValid && qty > 0, [fullName, phoneValid, qty])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }
  const label = PRICING[k]?.label || 'Produit en stock'
  const size = PRICING[k]?.size || ''

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({ product: `stock-${k}`, ref: id || '', zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    params.append('qty', String(qty))
    return `/confirmation?${params.toString()}`
  }, [k, id, zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, deliveryInfo.iso, deliveryInfo.window, qty])

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
                <div className="flex justify-between text-slate-700"><span>{label} (Ref {id}) × {qty}</span><span>{subtotal.toLocaleString()} FCFA</span></div>
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
