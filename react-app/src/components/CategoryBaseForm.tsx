import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMMUNES, DELIVERY, Zone, computeNextDelivery } from '../shared/delivery'
import { api, isApiConfigured } from '../lib/api/client'
import { buildOrderPayload } from '../lib/api/buildOrderPayload'
export type ColorMode = 'couleur' | 'noirblanc'
export type Finish = 'brillant' | 'mat'
export type Orientation = 'portrait' | 'paysage'
export type Border = 'avec' | 'sans'

export type PackOption = {
  id: string
  label: string
  photoCount: number
  price: number
}

export type CategoryBaseFormProps = {
  title: string
  productSlug: string
  productLabel?: string
  packOptions: PackOption[]
  bannerSrc?: string
  getBannerSrc?: (packId: string) => string
}

// DELIVERY, COMMUNES et Zone importés depuis '../shared/delivery'

export default function CategoryBaseForm({ title, productSlug, productLabel, packOptions, bannerSrc, getBannerSrc }: CategoryBaseFormProps) {
  const navigate = useNavigate()
  const [selectedPackId, setSelectedPackId] = useState<string>(packOptions[0]?.id)
  const selectedPack = useMemo(
    () => packOptions.find((p) => p.id === selectedPackId) || packOptions[0],
    [packOptions, selectedPackId]
  )

  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])
  const [qty, setQty] = useState<number>(1)
  const [colorMode, setColorMode] = useState<ColorMode>('couleur')
  const [finish, setFinish] = useState<Finish>('brillant')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [border, setBorder] = useState<Border>('sans')
  const [photos, setPhotos] = useState<File[]>([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const packPrice = selectedPack?.price ?? 0
  const subtotal = packPrice * qty
  const discountAmount = 0
  const totalAfterDiscount = subtotal - discountAmount
  const total = totalAfterDiscount + delivery
  const minPhotos = (selectedPack?.photoCount ?? 0) * qty

  const phoneValid = useMemo(() => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  }, [phone])

  const formValid = useMemo(
    () => fullName.trim().length > 1 && phoneValid && photos.length >= minPhotos,
    [fullName, phoneValid, photos.length, minPhotos]
  )

  const updateZone = (z: Zone) => {
    setZone(z)
    const first = COMMUNES[z][0]
    setCommune(first)
  }

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = Array.from(e.target.files || [])
    const imgs = list.filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) return
    setPhotos((prev) => {
      const key = (f: File) => f.name + ':' + f.size
      const prevKeys = new Set(prev.map(key))
      const newUnique = imgs.filter((f) => !prevKeys.has(key(f)))
      return [...prev, ...newUnique]
    })
    e.currentTarget.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({
      category: title,
      pack: selectedPack?.label || '',
      packId: selectedPack?.id || '',
      qty: String(qty),
      zone: String(zone),
      commune,
      subtotal: String(subtotal),
      discount: String(discountAmount),
      delivery: String(delivery),
      total: String(total),
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photos: String(photos.length),
      color: colorMode,
      finish,
      orientation,
      border,
      delivery_date: deliveryInfo.iso,
      delivery_window: deliveryInfo.window,
    })
    return `/confirmation?${params.toString()}`
  }, [title, selectedPack?.label, selectedPack?.id, qty, zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, email, photos.length, colorMode, finish, orientation, border, deliveryInfo.iso, deliveryInfo.window])

  const banner = getBannerSrc ? getBannerSrc(selectedPackId) : bannerSrc || '/img/banner.jpg'

  const handleOrder = async () => {
    if (!formValid) {
      setTouched(true)
      return
    }
    if (!isApiConfigured()) {
      navigate(confirmationTo)
      return
    }
    try {
      setSubmitting(true)
      const payload = buildOrderPayload({
        contact: { name: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined },
        delivery: { zone, commune, date: deliveryInfo.iso, window: deliveryInfo.window },
        items: [
          {
            product_slug: productSlug,
            product_label: productLabel ?? title,
            quantity: qty,
            unit_price: packPrice,
            options: {
              pack_id: selectedPack?.id,
              pack_label: selectedPack?.label,
              photos_per_pack: selectedPack?.photoCount,
              color_mode: colorMode,
              finish,
              orientation,
              border,
              total_photos_uploaded: photos.length,
            },
          },
        ],
        uploads: photos.length ? photos.map((f) => ({ original_name: f.name, mime_type: f.type })) : undefined,
        pricing: { subtotal, discount: discountAmount, delivery_fee: delivery, total },
      })
      const res = await api.createOrder(payload)
      const url = new URL(confirmationTo, window.location.origin)
      const qp = url.searchParams
      if (res.ref) qp.set('ref', res.ref)
      navigate(url.pathname + '?' + qp.toString())
    } catch (e) {
      console.error('createOrder failed (category base form), fallback:', e)
      navigate(confirmationTo)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src={banner} alt={title} className="w-full object-cover" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-slate-600 text-sm">Renseignez vos informations et vos préférences d’impression. Le total se met à jour automatiquement.</p>

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
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: nom@exemple.com"
                />
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
                <div className="text-sm font-medium mb-2">Texture</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFinish('brillant')} className={`rounded-full border px-3 py-1.5 text-sm ${finish === 'brillant' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Brillant</button>
                  <button type="button" onClick={() => setFinish('mat')} className={`rounded-full border px-3 py-1.5 text-sm ${finish === 'mat' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Mat</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Bordure</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setBorder('avec')} className={`rounded-full border px-3 py-1.5 text-sm ${border === 'avec' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Avec bord</button>
                  <button type="button" onClick={() => setBorder('sans')} className={`rounded-full border px-3 py-1.5 text-sm ${border === 'sans' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>Sans bord</button>
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
              <div className="text-sm font-medium mb-2">Pack</div>
              <div className="flex flex-wrap gap-3">
                {packOptions.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPackId(p.id)} className={`rounded-full border px-4 py-2 text-sm ${selectedPackId === p.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>
                    {p.label} — {p.price.toLocaleString()} FCFA
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Quantité</div>
              <select className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

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
                {COMMUNES[zone].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Vos photos <span className="text-red-600">(obligatoire)</span></div>
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    Déposez vos images ici ou
                    <span className="font-medium text-slate-900"> cliquez pour sélectionner</span>
                    <div className="text-xs text-slate-500">Formats acceptés: JPG, PNG, HEIC • Au moins {minPhotos} photos</div>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" />
                  <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">Ajouter des photos</span>
                </label>
                {touched && photos.length < minPhotos && (
                  <div className="mt-2 text-xs text-red-600">Veuillez ajouter au moins {minPhotos} photo(s) (actuellement {photos.length}).</div>
                )}
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {photos.map((f, idx) => {
                      const url = URL.createObjectURL(f)
                      return (
                        <div key={idx} className="relative overflow-hidden rounded-lg border border-slate-200">
                          <img src={url} alt={f.name} className="h-24 w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                          <button type="button" onClick={() => removePhoto(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">Retirer</button>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-600">Photos: {photos.length} / {minPhotos} requis</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="flex justify-between text-slate-600"><span>Options</span><span>{colorMode === 'couleur' ? 'Couleur' : 'Noir & Blanc'} • {finish === 'brillant' ? 'Brillant' : 'Mat'} • {orientation === 'portrait' ? 'Portrait' : 'Paysage'} • {border === 'avec' ? 'Avec bord' : 'Sans bord'}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total — Livraison: <span className="font-bold">{deliveryInfo.label.split(' ')[0]}</span> {deliveryInfo.label.split(' ').slice(1).join(' ')} ({deliveryInfo.window})</span><span>{total.toLocaleString()} FCFA</span></div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={handleOrder} disabled={!formValid || submitting} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid && !submitting ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`} aria-disabled={!formValid || submitting} title={!formValid ? 'Ajoutez les photos et complétez vos informations' : 'Passer à la confirmation'}>
                {submitting ? 'Envoi…' : 'Commander'}
              </button>
              <div className="text-xs text-slate-600">Contact: +225 07 87 50 26 37 — Livraison Mercredi & Samedi ({deliveryInfo.window})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
