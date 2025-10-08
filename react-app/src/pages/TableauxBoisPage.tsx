import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'
import { api, isApiConfigured } from '../lib/api/client'
import { buildOrderPayload } from '../lib/api/buildOrderPayload'
import { useMultiFileUpload } from '../lib/hooks/useMultiFileUpload'
import { makeFileKey } from '../lib/uploads'
import type { OrderUpload } from '../lib/api/types'

type Zone = 1 | 2 | 3
type Orientation = 'portrait' | 'paysage'
type ColorMode = 'couleur' | 'noirblanc'
type MarieLouise = 'avec' | 'sans'
type FrameColor = 'noir-vernis' | 'blanc-vernis' | 'marron-vernis' | 'bois-naturel'

const FORMATS = [
  // L (Large)
  { code: 'L_47x63', group: 'L', label: 'L — 47 × 63 cm', price: 70000, widthCm: 47, heightCm: 63 },
  { code: 'L_60x60', group: 'L', label: 'L — 60 × 60 cm (carré)', price: 80000, widthCm: 60, heightCm: 60 },
  // XL (Extra Large)
  { code: 'XL_67x89', group: 'XL', label: 'XL — 67 × 89 cm', price: 130000, widthCm: 67, heightCm: 89 },
  { code: 'XL_80x80', group: 'XL', label: 'XL — 80 × 80 cm (carré)', price: 150000, widthCm: 80, heightCm: 80 },
  // XXL (Extra Extra Large)
  { code: 'XXL_95x127', group: 'XXL', label: 'XXL — 95 × 127 cm', price: 220000, widthCm: 95, heightCm: 127 },
  { code: 'XXL_100x100', group: 'XXL', label: 'XXL — 100 × 100 cm (carré)', price: 200000, widthCm: 100, heightCm: 100 },
] as const

const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }
const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: ['Cocody centre','Adjamé','Plateau','Dokui','Yopougon','Gonzague','Port-Bouët','2 Plateaux','Abobo','Riviera',"M'badon",'Bonoumin','Faya','Attoban','Anono','Angré','Abatta'],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

type Quantities = Record<(typeof FORMATS)[number]['code'], number>
type PhotosByFormat = Record<(typeof FORMATS)[number]['code'], File[]>
type CustomFormatItem = { id: string; width: number | ''; height: number | ''; qty: number; photos: File[] }

type OrderItemInput = Parameters<typeof buildOrderPayload>[0]['items'][number]

export default function TableauxBoisPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [marieLouise, setMarieLouise] = useState<MarieLouise>('sans')
  const [frameColor, setFrameColor] = useState<FrameColor>('noir-vernis')
  const [colorMode, setColorMode] = useState<ColorMode>('couleur')
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])

  const initialQty = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, 0])) as Quantities, [])
  const initialPhotos = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.code, [] as File[]])) as PhotosByFormat, [])
  const [quantities, setQuantities] = useState<Quantities>(initialQty)
  const [photosByFormat, setPhotosByFormat] = useState<PhotosByFormat>(initialPhotos)
  const [customItems, setCustomItems] = useState<CustomFormatItem[]>([])
  const selectedStandard = useMemo(() => FORMATS.filter(f => (quantities[f.code] || 0) > 0), [quantities])
  const availableStandard = useMemo(() => FORMATS.filter(f => (quantities[f.code] || 0) === 0), [quantities])
  const [formatToAdd, setFormatToAdd] = useState<(typeof FORMATS)[number]['code'] | ''>('')
  const [qtyToAdd, setQtyToAdd] = useState<number>(1)
  const [touched, setTouched] = useState(false)
  const {
    registerFiles,
    unregisterFile,
    ensureUploaded: ensureUploadedFiles,
    uploading: uploadingPhotos,
    lastError: photosUploadError,
  } = useMultiFileUpload()

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
    setPhotosByFormat(prev => {
      const current = prev[code] || []
      const keys = new Set(current.map(file => makeFileKey(file)))
      const next = [...current]
      const newUnique: File[] = []
      imgs.forEach(file => {
        const key = makeFileKey(file)
        if (keys.has(key)) return
        keys.add(key)
        next.push(file)
        newUnique.push(file)
      })
      if (newUnique.length) registerFiles(newUnique)
      return { ...prev, [code]: next }
    })
    e.currentTarget.value = ''
  }
  const removePhoto = (code: (typeof FORMATS)[number]['code'], idx: number) => setPhotosByFormat(prev => {
    const current = prev[code] || []
    const target = current[idx]
    if (target) unregisterFile(target)
    return { ...prev, [code]: current.filter((_, i) => i !== idx) }
  })
  const setQty = (code: (typeof FORMATS)[number]['code'], q: number) => setQuantities(prev => ({ ...prev, [code]: Math.max(0, Math.min(50, q)) }))
  const removeStandardFormat = (code: (typeof FORMATS)[number]['code']) => {
    setQuantities(prev => ({ ...prev, [code]: 0 }))
    setPhotosByFormat(prev => {
      const current = prev[code] || []
      if (current.length) current.forEach(file => unregisterFile(file))
      return { ...prev, [code]: [] }
    })
  }
  const addStandardFormat = () => { const code = formatToAdd; if (!code) return; setQuantities(prev => ({ ...prev, [code]: Math.max(1, Math.min(50, qtyToAdd || 1)) })); setFormatToAdd(''); setQtyToAdd(1) }
  const addCustomItem = () => setCustomItems(prev => ([...prev, { id: Math.random().toString(36).slice(2, 9), width: '', height: '', qty: 0, photos: [] }]))
  const removeCustomItem = (id: string) => setCustomItems(prev => {
    const target = prev.find(it => it.id === id)
    if (target?.photos.length) target.photos.forEach(file => unregisterFile(file))
    return prev.filter(it => it.id !== id)
  })
  const updateCustomField = (id: string, field: keyof CustomFormatItem, value: any) => setCustomItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  const onCustomFilesSelected = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    const imgs = list.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setCustomItems(prev => prev.map(it => {
      if (it.id !== id) return it
      const key = (file: File) => makeFileKey(file)
      const map = new Map(it.photos.map(f => [key(f), f]))
      const newUnique: File[] = []
      imgs.forEach(file => {
        const k = key(file)
        if (map.has(k)) return
        map.set(k, file)
        newUnique.push(file)
      })
      if (newUnique.length) registerFiles(newUnique)
      const photos = Array.from(map.values())
      const qty = (it.qty || 0) === 0 ? photos.length : it.qty
      return { ...it, photos, qty }
    }))
    e.currentTarget.value = ''
  }
  const removeCustomPhoto = (id: string, idx: number) => setCustomItems(prev => prev.map(it => {
    if (it.id !== id) return it
    const target = it.photos[idx]
    const photos = it.photos.filter((_, i) => i !== idx)
    if (target) unregisterFile(target)
    const qty = Math.min(it.qty || 0, photos.length)
    return { ...it, photos, qty }
  }))
  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({ product: 'tableaux-bois', orientation, marieLouise, frameColor, color: colorMode, zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), email: email.trim(), delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    FORMATS.forEach(f => { const q = quantities[f.code] || 0; if (q > 0) { params.append(`qty_${f.code}`, String(q)); params.append(`photos_${f.code}`, String(photosByFormat[f.code]?.length || 0)) } })
    customItems.forEach((it, idx) => { if ((it.qty || 0) > 0) { const unit = computeCustomUnitPrice(it.width, it.height); params.append(`custom_${idx}_qty`, String(it.qty)); params.append(`custom_${idx}_width_cm`, String(it.width || '')); params.append(`custom_${idx}_height_cm`, String(it.height || '')); params.append(`custom_${idx}_photos`, String(it.photos.length)); params.append(`custom_${idx}_unit_price`, String(unit)) } })
    const LARGE_AREA_THRESHOLD_CM2 = 60 * 85
    const hasLargeStd = FORMATS.some(f => { const q = quantities[f.code] || 0; const area = f.widthCm * f.heightCm; return q > 0 && area >= LARGE_AREA_THRESHOLD_CM2 })
    const hasLargeCustom = customItems.some(it => typeof it.width === 'number' && typeof it.height === 'number' && (it.width * it.height) >= LARGE_AREA_THRESHOLD_CM2 && (it.qty || 0) > 0)
    const deliveryMethod = (hasLargeStd || hasLargeCustom) ? 'yango' : 'standard'
    params.append('delivery_method', deliveryMethod)
    return `/confirmation?${params.toString()}`
  }, [orientation, marieLouise, frameColor, colorMode, zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, email, quantities, photosByFormat, customItems, deliveryInfo.iso, deliveryInfo.window])

  const handleOrder = async () => {
    setTouched(true)
    if (!formValid || uploadingPhotos) return
    if (!isApiConfigured()) { navigate(confirmationTo); return }

    const standardEntries: Array<{ item: OrderItemInput; files: File[] }> = []
    FORMATS.forEach((format) => {
      const quantity = quantities[format.code] || 0
      if (!quantity) return
      const photos = photosByFormat[format.code] || []
      const item: OrderItemInput = {
        product_slug: 'tableaux-bois',
        product_label: 'Tableau Bois',
        quantity,
        unit_price: format.price,
        options: {
          format_code: format.code,
          format_label: format.label,
          width_cm: format.widthCm,
          height_cm: format.heightCm,
          orientation,
          color_mode: colorMode,
          marie_louise: marieLouise,
          frame_color: frameColor,
          photos_count: photos.length,
          variant: 'standard',
        },
      }
      standardEntries.push({ item, files: photos })
    })

    const customEntries: Array<{ item: OrderItemInput; files: File[] }> = []
    customItems.forEach((it, idx) => {
      const quantity = it.qty || 0
      const width = typeof it.width === 'number' ? it.width : 0
      const height = typeof it.height === 'number' ? it.height : 0
      if (!quantity || width <= 0 || height <= 0) return
      const unitPrice = computeCustomUnitPrice(width, height)
      if (unitPrice <= 0) return
      const item: OrderItemInput = {
        product_slug: 'tableaux-bois',
        product_label: 'Tableau Bois personnalisé',
        quantity,
        unit_price: unitPrice,
        options: {
          custom_id: it.id,
          width_cm: width,
          height_cm: height,
          orientation,
          color_mode: colorMode,
          marie_louise: marieLouise,
          frame_color: frameColor,
          photos_count: it.photos.length,
          variant: 'custom',
          index: idx,
        },
      }
      customEntries.push({ item, files: it.photos })
    })

    const itemEntries = [...standardEntries, ...customEntries]
    const allItems = itemEntries.map(entry => entry.item)
    const allFiles = itemEntries.flatMap(entry => entry.files)

    try {
      setSubmitting(true)
      const uploadsMap: Map<string, OrderUpload> = allFiles.length ? await ensureUploadedFiles(allFiles) : new Map()
      const uploads = allFiles.length
        ? itemEntries.flatMap((entry, index) =>
            entry.files.map((file) => {
              const uploaded = uploadsMap.get(makeFileKey(file))
              if (uploaded) {
                return { ...uploaded, item_index: uploaded.item_index ?? index }
              }
              return { original_name: file.name, mime_type: file.type, item_index: index }
            }),
          )
        : []

      const payload = buildOrderPayload({
        contact: { name: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined },
        delivery: { zone, commune, date: deliveryInfo.iso, window: deliveryInfo.window },
        items: allItems,
        uploads: uploads.length ? uploads : undefined,
        pricing: { subtotal, discount: discountAmount, delivery_fee: delivery, total },
      })

      const res = await api.createOrder(payload)
      const url = new URL(confirmationTo, window.location.origin)
      const qp = url.searchParams
      if (res.ref) qp.set('ref', res.ref)
      navigate(url.pathname + '?' + qp.toString())
    } catch (error) {
      console.error('createOrder failed (tableaux bois), fallback:', error)
      navigate(confirmationTo)
    } finally {
      setSubmitting(false)
    }
  }
  const groups = Array.from(new Set(FORMATS.map(f => f.group)))
  const formatsByGroup = (g: string) => FORMATS.filter(f => f.group === g)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src="/img/tableaux-bois-cover.jpg" alt="Tableaux Bois" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableaux (Bois)</h1>
          <p className="mt-1 text-slate-600 text-sm">Sélectionnez vos formats, options et importez vos photos. Remise 10% dès 5 tableaux, acompte 30% au-delà de 20 000 FCFA. Grands formats livrés via Yango.</p>
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
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium mb-2">Format</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOrientation('portrait')} className={`rounded-full border px-3 py-1.5 text-sm ${orientation === 'portrait' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Portrait</button>
                  <button type="button" onClick={() => setOrientation('paysage')} className={`rounded-full border px-3 py-1.5 text-sm ${orientation === 'paysage' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Paysage</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Marie-Louise</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMarieLouise('avec')} className={`rounded-full border px-3 py-1.5 text-sm ${marieLouise === 'avec' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Avec</button>
                  <button type="button" onClick={() => setMarieLouise('sans')} className={`rounded-full border px-3 py-1.5 text-sm ${marieLouise === 'sans' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Sans</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Finition bois</div>
                <div className="flex flex-wrap gap-2">
                  {(['noir-vernis','blanc-vernis','marron-vernis','bois-naturel'] as FrameColor[]).map(c => (
                    <button key={c} type="button" onClick={() => setFrameColor(c)} className={`rounded-full border px-3 py-1.5 text-sm ${frameColor === c ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>{
                      c === 'noir-vernis' ? 'Noir vernis' : c === 'blanc-vernis' ? 'Blanc vernis' : c === 'marron-vernis' ? 'Marron vernis' : 'Bois naturel'
                    }</button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm font-medium mb-2">Couleur photo</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setColorMode('couleur')} className={`rounded-full border px-3 py-1.5 text-sm ${colorMode === 'couleur' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Couleur</button>
                  <button type="button" onClick={() => setColorMode('noirblanc')} className={`rounded-full border px-3 py-1.5 text-sm ${colorMode === 'noirblanc' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Noir & Blanc</button>
                </div>
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
                    {selectedStandard.map(f => { const qty = quantities[f.code] || 0; const unit = f.price; return (
                      <div key={f.code} className="flex justify-between"><span>{f.label} × {qty}</span><span>{(unit * qty).toLocaleString()} FCFA</span></div>
                    )})}
                    {customItems.map((it, idx) => { const qty = it.qty || 0; const unit = computeCustomUnitPrice(it.width, it.height); const dims = `${it.width || '?'}×${it.height || '?'} cm`; return (
                      <div key={it.id} className="flex justify-between"><span>Perso #{idx + 1} ({dims}) × {qty}</span><span>{unit > 0 ? (unit * qty).toLocaleString() + ' FCFA' : '—'}</span></div>
                    )})}
                  </div>
                </div>
              )}
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              {discountAmount > 0 && (<div className="flex justify-between text-green-700"><span>Remise (10% dès 5 tableaux)</span><span>-{discountAmount.toLocaleString()} FCFA</span></div>)}
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              {(() => { const LARGE_AREA_THRESHOLD_CM2 = 60 * 85; const hasLargeStd = FORMATS.some(f => { const q = quantities[f.code] || 0; const area = f.widthCm * f.heightCm; return q > 0 && area >= LARGE_AREA_THRESHOLD_CM2 }); const hasLargeCustom = customItems.some(it => typeof it.width === 'number' && typeof it.height === 'number' && (it.width * it.height) >= LARGE_AREA_THRESHOLD_CM2 && (it.qty || 0) > 0); if (hasLargeStd || hasLargeCustom) { return <div className="flex justify-between text-slate-600"><span>Livraison</span><span>Yango (grands formats)</span></div> } return null })()}
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleOrder}
                disabled={!formValid || submitting || uploadingPhotos}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid && !submitting && !uploadingPhotos ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                {submitting ? 'Envoi…' : uploadingPhotos ? 'Téléversement…' : 'Commander'}
              </button>
              {uploadingPhotos && (<div className="text-xs text-slate-600">Téléversement des images en cours… veuillez patienter.</div>)}
              {photosUploadError && (<div className="text-xs text-red-600">Téléversement: {photosUploadError}. Vous pourrez renvoyer les fichiers après confirmation.</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
