import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'
import { api, isApiConfigured } from '../lib/api/client'
import { buildOrderPayload } from '../lib/api/buildOrderPayload'

type Zone = 1 | 2 | 3

const FORMATS = [
  { code: 'M32x48', group: 'Format unique', label: 'Format A3 (32 × 48 cm)', price: 15000, widthCm: 32, heightCm: 48 },
] as const

const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }
const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: ['Cocody centre','Adjamé','Plateau','Dokui','Yopougon','Gonzague','Port-Bouët','2 Plateaux','Abobo','Riviera',"M'badon",'Bonoumin','Faya','Attoban','Anono','Angré','Abatta'],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

type Quantities = Record<(typeof FORMATS)[number]['code'], number>
type PhotosByFormat = Record<(typeof FORMATS)[number]['code'], File[]>

export default function MetalPosterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])

  const initialQty = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, 0])) as Quantities, [])
  const initialPhotos = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, [] as File[]])) as PhotosByFormat, [])
  const [quantities, setQuantities] = useState<Quantities>(initialQty)
  const [photosByFormat, setPhotosByFormat] = useState<PhotosByFormat>(initialPhotos)
  const selectedStandard = useMemo(() => FORMATS.filter(f => (quantities[f.code] || 0) > 0), [quantities])
  const [touched, setTouched] = useState(false)

  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotalStandard = useMemo(() => FORMATS.reduce((sum, f) => sum + (quantities[f.code] || 0) * f.price, 0), [quantities])
  const subtotal = subtotalStandard
  const eligibleDiscount = useMemo(() => {
    const count = FORMATS.reduce((n, f) => n + (quantities[f.code] || 0), 0)
    return count >= 5
  }, [quantities])
  const discountAmount = eligibleDiscount ? Math.round(subtotal * 0.10) : 0
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const totalQty = useMemo(() => FORMATS.reduce((n, f) => n + (quantities[f.code] || 0), 0), [quantities])
  const phoneValid = useMemo(() => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 15 }, [phone])
  const perFormatOk = useMemo(() => {
    const stdOk = FORMATS.every(f => { const q = quantities[f.code] || 0; const imgs = photosByFormat[f.code]?.length || 0; return q === 0 || imgs >= q })
    return stdOk
  }, [quantities, photosByFormat])
  const formValid = useMemo(() => fullName.trim().length > 1 && phoneValid && totalQty > 0 && perFormatOk, [fullName, phoneValid, totalQty, perFormatOk])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }
  const onFilesSelected = (code: (typeof FORMATS)[number]['code']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    const imgs = list.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setPhotosByFormat(prev => { const cur = prev[code] || []; const key = (f: File) => f.name + ':' + f.size; const map = new Map(cur.map(f => [key(f), f])); imgs.forEach(f => map.set(key(f), f)); return { ...prev, [code]: Array.from(map.values()) } })
    e.currentTarget.value = ''
  }
  const removePhoto = (code: (typeof FORMATS)[number]['code'], idx: number) => setPhotosByFormat(prev => ({ ...prev, [code]: (prev[code] || []).filter((_, i) => i !== idx) }))
  const setQty = (code: (typeof FORMATS)[number]['code'], q: number) => setQuantities(prev => ({ ...prev, [code]: Math.max(0, Math.min(50, q)) }))
  const confirmationTo = useMemo(() => {
  const params = new URLSearchParams({ product: 'metalposter', zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), email: email.trim(), delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    FORMATS.forEach(f => { const q = quantities[f.code] || 0; if (q > 0) { params.append(`qty_${f.code}`, String(q)); params.append(`photos_${f.code}`, String(photosByFormat[f.code]?.length || 0)); } })
    const deliveryMethod = 'standard'
    params.append('delivery_method', deliveryMethod)
    return `/confirmation?${params.toString()}`
  }, [zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, email, quantities, photosByFormat])

  async function handleOrder() {
    setTouched(true)
    if (!formValid) return
    if (!isApiConfigured()) { navigate(confirmationTo); return }
    try {
      setSubmitting(true)
      const items = FORMATS.filter(f => quantities[f.code] > 0).map(f => ({
        product_slug: 'metalposter',
        product_label: 'Metal Poster',
        quantity: quantities[f.code],
        unit_price: f.price,
        options: { format: f.code, photos_count: photosByFormat[f.code]?.length || 0 },
      }))
      const payload = buildOrderPayload({
        contact: { name: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined },
        delivery: { zone, commune, date: deliveryInfo.iso, window: deliveryInfo.window },
        items,
        pricing: { subtotal, discount: discountAmount, delivery_fee: delivery, total },
      })
      const res = await api.createOrder(payload)
      const url = new URL(confirmationTo, window.location.origin)
      if (res.ref) url.searchParams.set('ref', res.ref)
      navigate(url.pathname + '?' + url.searchParams.toString())
    } catch (e) {
      console.error('createOrder failed, fallback:', e)
      navigate(confirmationTo)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src="/img/metalposter-cover.jpg" alt="Metal Poster" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metal Poster</h1>
          <p className="mt-1 text-slate-600 text-sm">15 000 FCFA seulement 🎉 • ✅ Format unique A3 (32 × 48 cm) • Pas de format personnalisé. Remise 10% dès 5 posters métal, acompte 30% si total &gt; 20 000 FCFA.</p>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom et Prénom <span className="text-red-600">*</span></label>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} onBlur={() => setTouched(true)} placeholder="Ex: Koffi Kouadio" />
                {touched && fullName.trim().length <= 1 && (<div className="mt-1 text-xs text-red-600">Nom et Prénom requis.</div>)}
              </div>
              <div>
                <label className="text-sm font-medium">Numéro de téléphone <span className="text-red-600">*</span></label>
                <input type="tel" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setTouched(true)} placeholder="Ex: +225 07 87 50 26 37" />
                {touched && !phoneValid && (<div className="mt-1 text-xs text-red-600">Numéro invalide (8 à 15 chiffres).</div>)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Email <span className="text-slate-400">(optionnel)</span></label>
                <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: nom@exemple.com" />
              </div>
            </div>

            

            <div>
              <div className="text-sm font-semibold mb-2">Format 32 × 48 cm</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FORMATS.map((f) => {
                  const qty = quantities[f.code] || 0
                  const imgs = photosByFormat[f.code]?.length || 0
                  return (
                    <div key={f.code} className={`rounded-lg border ${qty > 0 ? 'border-slate-900' : 'border-slate-200'} p-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{f.label}</div>
                          <div className="text-slate-600 text-sm">{f.price.toLocaleString()} FCFA</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Qté</label>
                          <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={qty} onChange={(e) => setQty(f.code, parseInt(e.target.value) || 0)}>
                            {Array.from({ length: 51 }, (_, i) => i).map(n => (<option key={n} value={n}>{n}</option>))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="text-xs text-slate-600">
                            Déposez vos images ici ou <span className="font-medium text-slate-900">cliquez pour sélectionner</span>
                            <div className="text-[11px] text-slate-500">Formats acceptés: JPG, PNG, HEIC • Minimum {qty} photo(s)</div>
                          </div>
                          <input type="file" accept="image/*" multiple onChange={onFilesSelected(f.code)} className="hidden" />
                          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white">Ajouter</span>
                        </label>
                        {touched && qty > 0 && imgs < qty && (<div className="mt-1 text-[11px] text-red-600">Veuillez ajouter au moins {qty} photo(s) pour ce format (actuellement {imgs}).</div>)}
                        {imgs > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-1">
                            {photosByFormat[f.code]!.map((file, idx) => {
                              const url = URL.createObjectURL(file)
                              return (
                                <div key={idx} className="relative overflow-hidden rounded border border-slate-200">
                                  <img src={url} alt={file.name} className="h-16 w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                                  <button type="button" onClick={() => removePhoto(f.code, idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Retirer</button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
              </div>
            </div>

            {/* Aucun format personnalisé sur Metal Poster */}

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
              {(selectedStandard.length > 0) && (
                <div className="mb-2">
                  <div className="font-medium mb-1">Formats sélectionnés</div>
                  <div className="space-y-1 text-slate-700">
                    {selectedStandard.map(f => { const qty = quantities[f.code] || 0; const unit = f.price; return (
                      <div key={f.code} className="flex justify-between"><span>{f.code} × {qty}</span><span>{(unit * qty).toLocaleString()} FCFA</span></div>
                    )})}
                  </div>
                </div>
              )}
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              {discountAmount > 0 && (<div className="flex justify-between text-green-700"><span>Remise (10% dès 5 tableaux)</span><span>-{discountAmount.toLocaleString()} FCFA</span></div>)}
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              {/* Pas de livraison Yango: format unique 32×48 seulement */}
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={handleOrder} disabled={!formValid || submitting} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid && !submitting ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`}>{submitting ? 'Envoi…' : 'Commander'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
