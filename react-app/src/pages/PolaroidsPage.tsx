import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'

type Zone = 1 | 2 | 3
type Pack = 'pola20' | 'pola20txt'
type ColorMode = 'couleur' | 'noirblanc'
type Finish = 'brillant' | 'mat'
type Orientation = 'portrait' | 'paysage'
type Border = 'avec' | 'sans'

const PRICES = {
  pola20: 5000,
  pola20txt: 8000,
}

const DELIVERY: Record<Zone, number> = {
  1: 1500,
  2: 2000,
  3: 3000,
}

const COMMUNES: Record<Zone, string[]> = {
  1: ['Marcory', 'Biétry', 'Zone 4', 'Zone 3', 'Anoumabo', 'Treichville', 'Koumassi'],
  2: [
    'Cocody centre',
    'Adjamé',
    'Plateau',
    'Dokui',
    'Yopougon',
    'Gonzague',
    'Port-Bouët',
    '2 Plateaux',
    'Abobo',
    'Riviera',
    "M'badon",
    'Bonoumin',
    'Faya',
    'Attoban',
    'Anono',
    'Angré',
    'Abatta',
  ],
  3: ['Anyama', 'Bassam', 'Williamsville', 'Bingerville'],
}

export default function PolaroidsPage() {
  const navigate = useNavigate()
  const [pack, setPack] = useState<Pack>('pola20')
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])
  const [qty, setQty] = useState<number>(1)
  // Options d'impression
  const [colorMode, setColorMode] = useState<ColorMode>('couleur')
  const [finish, setFinish] = useState<Finish>('brillant')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [border, setBorder] = useState<Border>('sans')
  // Photos importées
  const [photos, setPhotos] = useState<File[]>([])
  const [photoTexts, setPhotoTexts] = useState<string[]>([])
  // Infos client
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  // Gestion erreurs affichage
  const [touched, setTouched] = useState(false)

  const packPrice = useMemo(() => PRICES[pack], [pack])
  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotal = packPrice * qty
  const total = subtotal + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const minPhotos = 20 * qty

  const phoneValid = useMemo(() => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  }, [phone])

  const formValid = useMemo(
    () => fullName.trim().length > 1 && phoneValid && photos.length >= minPhotos,
    [fullName, phoneValid, photos.length, minPhotos]
  )

  // Mettre à jour la commune par défaut quand la zone change
  const updateZone = (z: Zone) => {
    setZone(z)
    const first = COMMUNES[z][0]
    setCommune(first)
  }

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = Array.from(e.target.files || [])
    const imgs = list.filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) return
    // éviter doublons par (name+size) et synchroniser les textes par photo
    setPhotos((prev) => {
      const key = (f: File) => f.name + ':' + f.size
      const prevTextByKey = new Map(prev.map((f, i) => [key(f), photoTexts[i] || '']))
      const prevKeys = new Set(prev.map(key))
      const newUnique = imgs.filter((f) => !prevKeys.has(key(f)))
      const merged = [...prev, ...newUnique]
      setPhotoTexts(merged.map((f) => prevTextByKey.get(key(f)) ?? ''))
      return merged
    })
    // reset input pour pouvoir ré-importer les mêmes noms
    e.currentTarget.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
    setPhotoTexts((prev) => prev.filter((_, i) => i !== idx))
  }

  const textFilled = useMemo(() => photoTexts.filter((t) => t.trim().length > 0).length, [photoTexts])

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({
      pack: pack === 'pola20' ? '20' : '20+texte',
      qty: String(qty),
      zone: String(zone),
      commune,
      subtotal: String(subtotal),
      delivery: String(delivery),
      total: String(total),
      name: fullName.trim(),
      phone: phone.trim(),
      photos: String(photos.length),
      color: colorMode,
      finish,
      orientation,
      border,
      textFilled: String(textFilled),
      delivery_date: deliveryInfo.iso,
      delivery_window: deliveryInfo.window,
    })
    return `/confirmation?${params.toString()}`
  }, [pack, qty, zone, commune, subtotal, delivery, total, fullName, phone, photos.length, colorMode, finish, orientation, border, textFilled, deliveryInfo.iso, deliveryInfo.window])

  const handleOrder = () => {
    if (!formValid) {
      setTouched(true)
      return
    }
    navigate(confirmationTo)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Visuel */}
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img
              src={pack === 'pola20txt' ? '/img/polaroidtexte-cover.jpg' : '/img/Pola2.webp'}
              alt={pack === 'pola20txt' ? 'Polaroïds avec texte' : 'Pack Polaroïds'}
              className="w-full object-cover"
            />
          </div>
        </div>

        {/* Configurateur */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Polaroïds</h1>
          <p className="mt-1 text-slate-600 text-sm">Renseignez vos informations et vos préférences d’impression. Le total se met à jour automatiquement.</p>

          <div className="mt-6 space-y-6">
            {/* 1) Nom et Prénom + Téléphone */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom et Prénom <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Ex: Koffi Kouadio"
                />
                {touched && fullName.trim().length <= 1 && (
                  <div className="mt-1 text-xs text-red-600">Nom et Prénom requis.</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Numéro de téléphone <span className="text-red-600">*</span></label>
                <input
                  type="tel"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Ex: +225 07 87 50 26 37"
                />
                {touched && !phoneValid && (
                  <div className="mt-1 text-xs text-red-600">Numéro invalide (8 à 15 chiffres).</div>
                )}
              </div>
            </div>

            {/* 2) Format, Texture, Bordure, Couleur */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Format */}
              <div>
                <div className="text-sm font-medium mb-2">Format</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      orientation === 'portrait' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('paysage')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      orientation === 'paysage' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Paysage
                  </button>
                </div>
              </div>
              {/* Texture */}
              <div>
                <div className="text-sm font-medium mb-2">Texture</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFinish('brillant')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      finish === 'brillant' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Brillant
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinish('mat')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      finish === 'mat' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Mat
                  </button>
                </div>
              </div>
              {/* Bordure */}
              <div>
                <div className="text-sm font-medium mb-2">Bordure</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBorder('avec')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      border === 'avec' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Avec bord
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorder('sans')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      border === 'sans' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Sans bord
                  </button>
                </div>
              </div>
              {/* Couleur */}
              <div className="md:col-span-3">
                <div className="text-sm font-medium mb-2">Couleur photo</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('couleur')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      colorMode === 'couleur' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Couleur
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('noirblanc')}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      colorMode === 'noirblanc' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    Noir & Blanc
                  </button>
                </div>
              </div>
            </div>

            {/* 3) Pack */}
            <div>
              <div className="text-sm font-medium mb-2">Pack</div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPack('pola20')}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    pack === 'pola20' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  20 photos — 5 000 FCFA
                </button>
                <button
                  onClick={() => setPack('pola20txt')}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    pack === 'pola20txt' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  20 photos avec texte — 8 000 FCFA
                </button>
              </div>
            </div>

            {/* 4) Quantité */}
            <div>
              <div className="text-sm font-medium mb-2">Quantité</div>
              <select
                className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* 5) Lieu de livraison */}
            {/* Zone de livraison */}
            <div>
              <div className="text-sm font-medium mb-2">Zone de livraison</div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((z) => (
                  <button
                    key={z}
                    onClick={() => updateZone(z as Zone)}
                    className={`rounded-lg border px-3 py-2 text-sm text-left ${
                      zone === z ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-medium">Zone {z}</div>
                    <div className="text-slate-600">{DELIVERY[z as Zone].toLocaleString()} FCFA</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Commune */}
            <div>
              <div className="text-sm font-medium mb-2">Commune</div>
              <select
                className="w-full md:w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
              >
                {COMMUNES[zone].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 6) Import des photos */}
            <div>
              <div className="text-sm font-medium mb-2">Vos photos <span className="text-red-600">(obligatoire)</span></div>
              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    Déposez vos images ici ou
                    <span className="font-medium text-slate-900"> cliquez pour sélectionner</span>
                    <div className="text-xs text-slate-500">Formats acceptés: JPG, PNG, HEIC • Au moins {minPhotos} photos (20 par pack)</div>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" />
                  <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">Ajouter des photos</span>
                </label>
                {touched && photos.length < minPhotos && (
                  <div className="mt-2 text-xs text-red-600">Veuillez ajouter au moins {minPhotos} photo(s) (actuellement {photos.length}).</div>
                )}
                {/* Aperçu */}
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {photos.map((f, idx) => {
                      const url = URL.createObjectURL(f)
                      return (
                        <div key={idx} className="relative overflow-hidden rounded-lg border border-slate-200">
                          <img src={url} alt={f.name} className="h-24 w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                          <button type="button" onClick={() => removePhoto(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">Retirer</button>
                          {pack === 'pola20txt' && (
                            <input
                              type="text"
                              maxLength={50}
                              value={photoTexts[idx] ?? ''}
                              onChange={(e) =>
                                setPhotoTexts((prev) => {
                                  const copy = [...prev]
                                  copy[idx] = e.target.value
                                  return copy
                                })
                              }
                              placeholder={`Texte ${idx + 1}`}
                              className="w-full border-t border-slate-200 px-2 py-1 text-xs focus:outline-none"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-600">
                  Photos: {photos.length} / {minPhotos} requis
                  {pack === 'pola20txt' && photos.length > 0 && (
                    <span className="ml-2">• Textes saisis: {textFilled} / {photos.length}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Récap */}
              <div className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
                <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
                <div className="flex justify-between text-slate-600"><span>Options</span><span>{colorMode === 'couleur' ? 'Couleur' : 'Noir & Blanc'} • {finish === 'brillant' ? 'Brillant' : 'Mat'} • {orientation === 'portrait' ? 'Portrait' : 'Paysage'} • {border === 'avec' ? 'Avec bord' : 'Sans bord'}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total — Livraison: <span className="font-bold">{deliveryInfo.label.split(' ')[0]}</span> {deliveryInfo.label.split(' ').slice(1).join(' ')} ({deliveryInfo.window})</span><span>{total.toLocaleString()} FCFA</span></div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleOrder}
                disabled={!formValid}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${
                  formValid ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'
                }`}
                aria-disabled={!formValid}
                title={!formValid ? 'Ajoutez les photos et complétez vos informations' : 'Passer à la confirmation'}
              >
                Commander
              </button>
              <a href="/Albumphoto" className="rounded-full border border-slate-300 px-5 py-2 text-sm hover:border-slate-400">Album Photo</a>
              <div className="text-xs text-slate-600">Contact: +225 07 87 50 26 37 — Prochaine livraison: <strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} ({deliveryInfo.window})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
