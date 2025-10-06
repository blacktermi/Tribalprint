import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'

type Zone = 1 | 2 | 3
type Shape = 'rect' | 'square'

const FORMATS = [
  { code: 'A6',  group: 'Petit format',       label: 'Format A6 (10,5 × 14,8 cm)', price: 750,   widthCm: 10.5, heightCm: 14.8 },
  { code: 'A5',  group: 'Petit format',       label: 'Format A5 (15 × 21 cm)',      price: 1500,  widthCm: 15,   heightCm: 21 },
  { code: 'A4',  group: 'Petit format',       label: 'Format A4 (21 × 30 cm)',      price: 2500,  widthCm: 21,   heightCm: 30 },
  { code: 'A4S', group: 'Petit format',       label: 'Format A4 Carré (21 × 21 cm)', price: 2500, widthCm: 21,   heightCm: 21 },
  { code: 'A3',  group: 'Moyen format',       label: 'Format A3 (32 × 48 cm)',      price: 5000,  widthCm: 32,   heightCm: 48 },
  { code: 'A3S', group: 'Moyen format',       label: 'Format A3 Carré (32 × 32 cm)', price: 5000, widthCm: 32,   heightCm: 32 },
  { code: 'A2',  group: 'Moyen format',       label: 'Format A2 (42 × 60 cm)',      price: 10000, widthCm: 42,   heightCm: 60 },
  { code: 'A2S', group: 'Moyen format',       label: 'Format A2 Carré (42 × 42 cm)', price: 10000, widthCm: 42,  heightCm: 42 },
  { code: 'A1',  group: 'Grand format',       label: 'Format A1 (60 × 85 cm)',      price: 15000, widthCm: 60,   heightCm: 85 },
  { code: 'A1S', group: 'Grand format',       label: 'Format A1 Carré (60 × 60 cm)', price: 15000, widthCm: 60,  heightCm: 60 },
  { code: 'A0',  group: 'Très grand format',  label: 'Format A0 (85 × 119 cm)',     price: 20000, widthCm: 85,   heightCm: 119 },
  { code: 'A0S', group: 'Très grand format',  label: 'Format A0 Carré (85 × 85 cm)', price: 20000, widthCm: 85,  heightCm: 85 },
] as const

const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }
const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: ['Cocody centre','Adjamé','Plateau','Dokui','Yopougon','Gonzague','Port-Bouët','2 Plateaux','Abobo','Riviera',"M'badon",'Bonoumin','Faya','Attoban','Anono','Angré','Abatta'],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

type Quantities = Record<(typeof FORMATS)[number]['code'], number>
type PhotosByFormat = Record<(typeof FORMATS)[number]['code'], File[]>
type ShapesByFormat = Record<(typeof FORMATS)[number]['code'], Shape>
type CustomFormatItem = { id: string; width: number | ''; height: number | ''; qty: number; photos: File[] }

export default function PostersPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])

  const initialQty = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, 0])) as Quantities, [])
  const initialPhotos = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, [] as File[]])) as PhotosByFormat, [])
  const [quantities, setQuantities] = useState<Quantities>(initialQty)
  const [photosByFormat, setPhotosByFormat] = useState<PhotosByFormat>(initialPhotos)
  const initialShapes = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, 'rect'])) as ShapesByFormat, [])
  const [shapesByFormat, setShapesByFormat] = useState<ShapesByFormat>(initialShapes)
  const [customItems, setCustomItems] = useState<CustomFormatItem[]>([])
  const selectedStandard = useMemo(() => FORMATS.filter(f => (quantities[f.code] || 0) > 0), [quantities])
  const availableStandard = useMemo(() => FORMATS.filter(f => (quantities[f.code] || 0) === 0), [quantities])
  const [formatToAdd, setFormatToAdd] = useState<(typeof FORMATS)[number]['code'] | ''>('')
  const [qtyToAdd, setQtyToAdd] = useState<number>(1)
  const [touched, setTouched] = useState(false)

  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotalStandard = useMemo(() => FORMATS.reduce((sum, f) => sum + (quantities[f.code] || 0) * f.price, 0), [quantities])
  const computeCustomUnitPrice = (w: number | '', h: number | ''): number => {
    if (typeof w !== 'number' || typeof h !== 'number' || !isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return 0
    const area = w * h
    const std = FORMATS.map(f => ({ price: f.price, area: f.widthCm * f.heightCm })).sort((a, b) => a.area - b.area)
    const min = std[0], max = std[std.length - 1]
    if (area <= min.area) return min.price
    for (let i = 0; i < std.length; i++) if (area <= std[i].area) return std[i].price
    const unit = max.price / max.area
    return Math.round((unit * area) / 1000) * 1000
  }
  const parseDim = (v: string) => {
    const s = v.replace(',', '.').trim()
    if (s === '') return ''
    const n = Number(s)
    return isFinite(n) && n >= 0 ? n : ''
  }
  const subtotalCustom = useMemo(() => customItems.reduce((s, it) => s + (it.qty || 0) * computeCustomUnitPrice(it.width, it.height), 0), [customItems])
  const subtotal = subtotalStandard + subtotalCustom
  const eligibleDiscount = useMemo(() => {
    const count = FORMATS.reduce((n, f) => n + (quantities[f.code] || 0), 0) + customItems.reduce((n, it) => n + (it.qty || 0), 0)
    return count >= 5
  }, [quantities, customItems])
  const discountAmount = eligibleDiscount ? Math.round(subtotal * 0.10) : 0
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const totalQty = useMemo(() => FORMATS.reduce((n, f) => n + (quantities[f.code] || 0), 0) + customItems.reduce((n, it) => n + (it.qty || 0), 0), [quantities, customItems])
  const phoneValid = useMemo(() => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 && digits.length <= 15 }, [phone])
  const perFormatOk = useMemo(() => {
    const stdOk = FORMATS.every(f => { const q = quantities[f.code] || 0; const imgs = photosByFormat[f.code]?.length || 0; return q === 0 || imgs >= q })
    const customOk = customItems.every(it => { const q = it.qty || 0; const imgs = it.photos.length; const dimsOk = typeof it.width === 'number' && it.width > 0 && typeof it.height === 'number' && it.height > 0; return q === 0 || (imgs >= q && dimsOk) })
    return stdOk && customOk
  }, [quantities, photosByFormat, customItems])
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
  const setShape = (code: (typeof FORMATS)[number]['code'], shape: Shape) => setShapesByFormat(prev => ({ ...prev, [code]: shape }))
  const removeStandardFormat = (code: (typeof FORMATS)[number]['code']) => { setQuantities(prev => ({ ...prev, [code]: 0 })); setPhotosByFormat(prev => ({ ...prev, [code]: [] })) }
  const addStandardFormat = () => { const code = formatToAdd; if (!code) return; setQuantities(prev => ({ ...prev, [code]: Math.max(1, Math.min(50, qtyToAdd || 1)) })); setFormatToAdd(''); setQtyToAdd(1) }
  const addCustomItem = () => setCustomItems(prev => ([...prev, { id: Math.random().toString(36).slice(2, 9), width: '', height: '', qty: 0, photos: [] }]))
  const removeCustomItem = (id: string) => setCustomItems(prev => prev.filter(it => it.id !== id))
  const updateCustomField = (id: string, field: keyof CustomFormatItem, value: any) => setCustomItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  const onCustomFilesSelected = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    const imgs = list.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setCustomItems(prev => prev.map(it => { if (it.id !== id) return it; const key = (f: File) => f.name + ':' + f.size; const map = new Map(it.photos.map(f => [key(f), f])); imgs.forEach(f => map.set(key(f), f)); const photos = Array.from(map.values()); const qty = (it.qty || 0) === 0 ? photos.length : it.qty; return { ...it, photos, qty } }))
    e.currentTarget.value = ''
  }
  const removeCustomPhoto = (id: string, idx: number) => setCustomItems(prev => prev.map(it => { if (it.id !== id) return it; const photos = it.photos.filter((_, i) => i !== idx); const qty = Math.min(it.qty || 0, photos.length); return { ...it, photos, qty } }))
  const confirmationTo = useMemo(() => {
  const params = new URLSearchParams({ product: 'posters', zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), email: email.trim(), delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    FORMATS.forEach(f => { const q = quantities[f.code] || 0; if (q > 0) { params.append(`qty_${f.code}`, String(q)); params.append(`photos_${f.code}`, String(photosByFormat[f.code]?.length || 0)); params.append(`shape_${f.code}`, shapesByFormat[f.code]) } })
    customItems.forEach((it, idx) => { if ((it.qty || 0) > 0) { const unit = computeCustomUnitPrice(it.width, it.height); params.append(`custom_${idx}_qty`, String(it.qty)); params.append(`custom_${idx}_width_cm`, String(it.width || '')); params.append(`custom_${idx}_height_cm`, String(it.height || '')); params.append(`custom_${idx}_photos`, String(it.photos.length)); params.append(`custom_${idx}_unit_price`, String(unit)) } })
  const a1 = FORMATS.find(f => f.code === 'A1')!; const areaA1 = a1.widthCm * a1.heightCm
  const hasLargeStd = ['A1','A1S','A0','A0S'].some(code => (quantities as any)[code] > 0)
    const hasLargeCustom = customItems.some(it => typeof it.width === 'number' && typeof it.height === 'number' && (it.width * it.height) >= areaA1 && (it.qty || 0) > 0)
    const deliveryMethod = (hasLargeStd || hasLargeCustom) ? 'yango' : 'standard'
    params.append('delivery_method', deliveryMethod)
    return `/confirmation?${params.toString()}`
  }, [zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, email, quantities, photosByFormat, shapesByFormat, customItems])

  const handleOrder = () => { setTouched(true); if (!formValid) return; navigate(confirmationTo) }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src="/img/posters-cover.jpg" alt="Posters" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posters</h1>
          <p className="mt-1 text-slate-600 text-sm">Sélectionnez vos formats standards ou personnalisés. Remise 10% dès 5 affiches, acompte 30% au-delà de 20 000 FCFA. Grands formats livrés via Yango.</p>

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

            {/* Email optionnel */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Email <span className="text-slate-400">(optionnel)</span></label>
                <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: nom@exemple.com" />
              </div>
            </div>

            

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Formats standards sélectionnés</div>
                <div className="flex items-center gap-2">
                  <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={formatToAdd} onChange={(e) => setFormatToAdd(e.target.value as any)}>
                    <option value="">Ajouter un format…</option>
                    {availableStandard.map(f => (<option key={f.code} value={f.code}>{f.label} — {f.price.toLocaleString()} FCFA</option>))}
                  </select>
                  <input type="number" min={1} max={50} value={qtyToAdd} onChange={(e) => setQtyToAdd(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" />
                  <button type="button" onClick={addStandardFormat} disabled={!formatToAdd} className={`rounded-full px-3 py-1.5 text-xs font-medium ${formatToAdd ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-600 cursor-not-allowed'}`}>Ajouter</button>
                </div>
              </div>
              {selectedStandard.length === 0 && (<div className="text-xs text-slate-600">Aucun format standard sélectionné. Utilisez « Ajouter un format… » pour commencer.</div>)}
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedStandard.map((f) => {
                  const qty = quantities[f.code] || 0
                  const imgs = photosByFormat[f.code]?.length || 0
                  return (
                    <div key={f.code} className={`rounded-lg border ${qty > 0 ? 'border-slate-900' : 'border-slate-200'} p-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{f.label}</div>
                          <div className="text-slate-600 text-sm">{f.price.toLocaleString()} FCFA</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            <span className="text-slate-700">Version:</span>
                            <button type="button" onClick={() => setShape(f.code, 'rect')} className={`rounded-full border px-2 py-0.5 ${shapesByFormat[f.code] === 'rect' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Rectangulaire</button>
                            <button type="button" onClick={() => setShape(f.code, 'square')} className={`rounded-full border px-2 py-0.5 ${shapesByFormat[f.code] === 'square' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Carré</button>
                          </div>
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
                      <div className="mt-3 flex justify-end">
                        <button type="button" onClick={() => removeStandardFormat(f.code)} className="text-xs text-red-600 hover:underline">Supprimer ce format</button>
                      </div>
                    </div>
                  )})}
              </div>
            </div>

            {/* Formats personnalisés */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Formats personnalisés</div>
                <button type="button" onClick={addCustomItem} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs hover:border-slate-400">Ajouter un format</button>
              </div>
              {customItems.length === 0 && (<div className="text-xs text-slate-600">Ajoutez vos propres dimensions (en cm). Le prix unitaire est estimé automatiquement selon la surface.</div>)}
              <div className="space-y-4 mt-3">
                {customItems.map((it, idx) => {
                  const imgs = it.photos.length
                  return (
                    <div key={it.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Personnalisé #{idx + 1}</div>
                        <button type="button" onClick={() => removeCustomItem(it.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-5">
                        <div>
                          <label className="text-xs">Largeur (cm) *</label>
                          <input type="text" inputMode="decimal" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={it.width} onChange={(e) => updateCustomField(it.id, 'width', parseDim(e.target.value))} />
                        </div>
                        <div>
                          <label className="text-xs">Hauteur (cm) *</label>
                          <input type="text" inputMode="decimal" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={it.height} onChange={(e) => updateCustomField(it.id, 'height', parseDim(e.target.value))} />
                        </div>
                        <div>
                          <label className="text-xs">Qté</label>
                          <input type="number" min={0} max={50} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={it.qty} onChange={(e) => updateCustomField(it.id, 'qty', Math.max(0, Math.min(50, Number(e.target.value) || 0)))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs">Prix unitaire estimé</label>
                          <div className="mt-1 h-[34px] flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-sm">{(() => { const unit = computeCustomUnitPrice(it.width, it.height); return unit > 0 ? `${unit.toLocaleString()} FCFA` : '—' })()}</div>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="text-xs text-slate-600">
                            Déposez vos images ici ou <span className="font-medium text-slate-900">cliquez pour sélectionner</span>
                            <div className="text-[11px] text-slate-500">Formats acceptés: JPG, PNG, HEIC • Minimum {it.qty} photo(s)</div>
                          </div>
                          <input type="file" accept="image/*" multiple onChange={onCustomFilesSelected(it.id)} className="hidden" />
                          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white">Ajouter</span>
                        </label>
                        {touched && (it.qty || 0) > 0 && imgs < (it.qty || 0) && (<div className="mt-1 text-[11px] text-red-600">Veuillez ajouter au moins {it.qty} photo(s) pour ce format (actuellement {imgs}).</div>)}
                        {imgs > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-1">
                            {it.photos.map((file, pidx) => {
                              const url = URL.createObjectURL(file)
                              return (
                                <div key={pidx} className="relative overflow-hidden rounded border border-slate-200">
                                  <img src={url} alt={file.name} className="h-16 w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                                  <button type="button" onClick={() => removeCustomPhoto(it.id, pidx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Retirer</button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
              {(selectedStandard.length > 0 || customItems.length > 0) && (
                <div className="mb-2">
                  <div className="font-medium mb-1">Formats sélectionnés</div>
                  <div className="space-y-1 text-slate-700">
                    {selectedStandard.map(f => { const qty = quantities[f.code] || 0; const unit = f.price; const shapeLabel = shapesByFormat[f.code] === 'square' ? 'Carré' : 'Rect'; return (
                      <div key={f.code} className="flex justify-between"><span>{f.code} ({shapeLabel}) × {qty}</span><span>{(unit * qty).toLocaleString()} FCFA</span></div>
                    )})}
                    {customItems.map((it, idx) => { const qty = it.qty || 0; const unit = computeCustomUnitPrice(it.width, it.height); const dims = `${it.width || '?'}×${it.height || '?'} cm`; return (
                      <div key={it.id} className="flex justify-between"><span>Perso #{idx + 1} ({dims}) × {qty}</span><span>{unit > 0 ? (unit * qty).toLocaleString() + ' FCFA' : '—'}</span></div>
                    )})}
                  </div>
                </div>
              )}
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              {discountAmount > 0 && (<div className="flex justify-between text-green-700"><span>Remise (10% dès 5 affiches)</span><span>-{discountAmount.toLocaleString()} FCFA</span></div>)}
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              {(() => { const a1 = FORMATS.find(f => f.code === 'A1')!; const areaA1 = a1.widthCm * a1.heightCm; const hasLargeStd = ['A1','A1S','A0','A0S'].some(code => (quantities as any)[code] > 0); const hasLargeCustom = customItems.some(it => typeof it.width === 'number' && typeof it.height === 'number' && (it.width * it.height) >= areaA1 && (it.qty || 0) > 0); if (hasLargeStd || hasLargeCustom) { return <div className="flex justify-between text-slate-600"><span>Livraison</span><span>Yango (grands formats)</span></div> } return null })()}
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
