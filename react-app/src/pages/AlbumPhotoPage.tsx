import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery } from '../shared/delivery'

type Zone = 1 | 2 | 3
type AlbumFormat = 'A5' | 'A4'
type ProductType = 'album' | 'magazine' | 'document'
type CoverFinish = 'brillant' | 'mat'

// Politique de prix: base pour 10 pages (20 photos), supplément par page au-delà
const BASE_PRICE: Record<AlbumFormat, number> = { A5: 10000, A4: 15000 }
const PER_PAGE_EXTRA: Record<AlbumFormat, number> = { A5: 500, A4: 800 }

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

export default function AlbumPhotoPage() {
  const navigate = useNavigate()
  const [prodType, setProdType] = useState<ProductType>('album')
  const [format, setFormat] = useState<AlbumFormat>('A5')
  const [qty, setQty] = useState<number>(1)
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState<string>(COMMUNES[1][0])

  // Spécifiques Album
  const [pages, setPages] = useState<number>(10) // 20 photos = 10 pages (1 page pour 2 photos)
  const [coverText, setCoverText] = useState<string>('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverFinish, setCoverFinish] = useState<CoverFinish>('brillant')

  // Photos à importer (intérieures)
  const [photos, setPhotos] = useState<File[]>([])
  // Document PDF (magazine/document)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  // Infos client
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  // Pour les albums, on calcule les pages à partir des photos afin d'éviter des pages blanches
  const divisor = 2 * qty // 2 photos par page et par album
  const albumPages = useMemo(() => (photos.length > 0 ? Math.ceil(photos.length / divisor) : 0), [photos.length, divisor])
  const albumDivisible = useMemo(() => (photos.length > 0 ? photos.length % divisor === 0 : false), [photos.length, divisor])
  const minAlbumPhotos = useMemo(() => 20 * qty, [qty])

  // Pages utilisées pour le prix: pour album = pages calculées (au moins 10), sinon la sélection utilisateur
  const pagesForPrice = useMemo(() => {
    if (prodType === 'album') return Math.max(10, albumPages)
    return pages
  }, [prodType, albumPages, pages])

  const price = useMemo(() => {
    const base = BASE_PRICE[format]
    const extraPages = Math.max(0, pagesForPrice - 10)
    return base + extraPages * PER_PAGE_EXTRA[format]
  }, [format, pagesForPrice])
  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotal = price * qty
  const total = subtotal + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  // 1 page = 2 photos (non utilisé pour album; pour album on valide la divisibilité des photos)
  const minPhotos = useMemo(() => (prodType === 'album' ? 0 : pages * 2 * qty), [prodType, pages, qty])

  const phoneValid = useMemo(() => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  }, [phone])

  const formValid = useMemo(() => {
    const commonOk = fullName.trim().length > 1 && phoneValid && (prodType === 'album' ? albumPages > 0 : pages > 0)
    if (prodType === 'album') {
      return (
        commonOk &&
        photos.length >= minAlbumPhotos &&
        albumDivisible &&
        !!coverImage &&
        coverText.trim().length > 0
      )
    }
    // magazine/document: PDF requis, on n'exige pas les photos/cover
    return commonOk && !!pdfFile
  }, [prodType, fullName, phoneValid, pages, albumPages, photos.length, minAlbumPhotos, albumDivisible, coverImage, coverText, pdfFile])

  const updateZone = (z: Zone) => {
    setZone(z)
    setCommune(COMMUNES[z][0])
  }

  const onCoverSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = (e.target.files && e.target.files[0]) || null
    if (f && f.type.startsWith('image/')) setCoverImage(f)
    e.currentTarget.value = ''
  }

  const onPdfSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = (e.target.files && e.target.files[0]) || null
    if (f && f.type === 'application/pdf') setPdfFile(f)
    e.currentTarget.value = ''
  }

  const onPhotosSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
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
      product: 'albumphoto',
      type: prodType,
      format,
      qty: String(qty),
      zone: String(zone),
      commune,
      pages: String(prodType === 'album' ? albumPages : pages),
      subtotal: String(subtotal),
      delivery: String(delivery),
      total: String(total),
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photos: String(photos.length),
      coverText: coverText.trim(),
      coverImage: coverImage ? '1' : '0',
      pdf: pdfFile ? '1' : '0',
      coverFinish,
      delivery_date: deliveryInfo.iso,
      delivery_window: deliveryInfo.window,
    })
    return `/confirmation?${params.toString()}`
  }, [prodType, format, qty, zone, commune, pages, subtotal, delivery, total, fullName, phone, email, photos.length, coverText, coverImage, pdfFile, coverFinish, deliveryInfo.iso, deliveryInfo.window])

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
            <img src="/img/albumphoto-cover.jpg" alt="Album Photo" className="w-full object-cover" />
          </div>
        </div>

        {/* Configurateur */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Album / Document</h1>
          <p className="mt-1 text-slate-600 text-sm">Sélectionnez le type de produit, choisissez le format et importez vos fichiers. 2 photos par page.</p>

          {/* Type de produit */}
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Type</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProdType('album')}
                className={`rounded-full border px-3 py-1.5 text-sm ${prodType === 'album' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}
              >Album photo</button>
              <button
                type="button"
                onClick={() => setProdType('magazine')}
                className={`rounded-full border px-3 py-1.5 text-sm ${prodType === 'magazine' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}
              >Magazine (PDF)</button>
              <button
                type="button"
                onClick={() => setProdType('document')}
                className={`rounded-full border px-3 py-1.5 text-sm ${prodType === 'document' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}
              >Document (PDF)</button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {/* 1) Nom et Téléphone */}
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

            {/* 2) Format d'album */}
            <div>
              <div className="text-sm font-medium mb-2">Format (prix de base pour 10 pages)</div>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormat('A5')}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    format === 'A5' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  Format A5 — {BASE_PRICE.A5.toLocaleString()} FCFA
                </button>
                <button
                  onClick={() => setFormat('A4')}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    format === 'A4' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  Format A4 — {BASE_PRICE.A4.toLocaleString()} FCFA
                </button>
              </div>
            </div>

            {/* 3) Champs spécifiques album ou PDF */}
            <div className="grid gap-4 md:grid-cols-2">
              {prodType === 'album' ? (
                <div>
                  <label className="text-sm font-medium">Nombre de pages (calculé) <span className="text-red-600">(1 page pour deux photos)</span></label>
                  <div className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50">
                    {albumPages > 0 ? `${albumPages} pages` : 'Ajoutez des photos pour calculer le nombre de pages'}
                  </div>
                  {!albumDivisible && photos.length > 0 && (
                    <div className="mt-1 text-xs text-red-600">Le nombre de photos doit être divisible par {divisor} (2 par page × quantité) pour éviter des pages blanches.</div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Nombre de pages <span className="text-red-600">(1 page pour deux photos) *</span></label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value) || 10)}
                  >
                    {Array.from({ length: 41 }, (_, i) => 10 + i).map((p) => (
                      <option key={p} value={p}>{p} pages</option>
                    ))}
                  </select>
                </div>
              )}
              {prodType === 'album' ? (
                <>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Image de couverture <span className="text-red-600">*</span></label>
                    <div className="rounded-xl border border-dashed border-slate-300 p-4">
                      <label className="flex cursor-pointer items-center justify-between gap-4">
                        <div className="text-sm text-slate-600">
                          Cliquez pour choisir un fichier ou faites-le glisser ici
                          <div className="text-xs text-slate-500">Formats acceptés: JPG, PNG, HEIC</div>
                        </div>
                        <input type="file" accept="image/*" onChange={onCoverSelected} className="hidden" />
                        <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">Choisir</span>
                      </label>
                      {coverImage && (
                        <div className="mt-3 text-xs text-slate-700">Fichier sélectionné: {coverImage.name}</div>
                      )}
                      <div className="mt-2 text-xs text-slate-500">La photo de couverture ne compte pas dans le calcul des pages.</div>
                      {touched && !coverImage && (
                        <div className="mt-2 text-xs text-red-600">Veuillez ajouter une image de couverture.</div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Texte de couverture <span className="text-red-600">*</span></label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      rows={3}
                      value={coverText}
                      onChange={(e) => setCoverText(e.target.value)}
                      placeholder="Votre texte sur la couverture (ex: Nos souvenirs 2025)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium mb-2">Pelliculage de couverture</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCoverFinish('brillant')}
                        className={`rounded-full border px-3 py-1.5 text-sm ${coverFinish === 'brillant' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}
                      >Brillant</button>
                      <button
                        type="button"
                        onClick={() => setCoverFinish('mat')}
                        className={`rounded-full border px-3 py-1.5 text-sm ${coverFinish === 'mat' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}
                      >Mat</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Votre document PDF <span className="text-red-600">*</span></label>
                  <div className="rounded-xl border border-dashed border-slate-300 p-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        Cliquez pour choisir un fichier ou faites-le glisser ici
                        <div className="text-xs text-slate-500">Format accepté: PDF uniquement</div>
                      </div>
                      <input type="file" accept="application/pdf" onChange={onPdfSelected} className="hidden" />
                      <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">Choisir</span>
                    </label>
                    {pdfFile && (
                      <div className="mt-3 text-xs text-slate-700">Fichier sélectionné: {pdfFile.name}</div>
                    )}
                    {touched && !pdfFile && (
                      <div className="mt-2 text-xs text-red-600">Veuillez ajouter votre document PDF.</div>
                    )}
                  </div>
                </div>
              )}
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
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* 5) Lieu de livraison */}
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
            <div>
              <div className="text-sm font-medium mb-2">Commune</div>
              <select
                className="w-full md:w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
              >
                {COMMUNES[zone].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 6) Import des photos (intérieures) - seulement pour Album */}
            {prodType === 'album' && (
              <div>
                <div className="text-sm font-medium mb-2">Vos photos (intérieures) <span className="text-red-600">(obligatoire)</span></div>
                <div className="rounded-xl border border-dashed border-slate-300 p-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      Déposez vos images ici ou
                      <span className="font-medium text-slate-900"> cliquez pour sélectionner</span>
                      <div className="text-xs text-slate-500">Formats acceptés: JPG, PNG, HEIC • Nombre de photos divisible par {divisor} (2 par page × quantité) • La photo de couverture n'est pas comptée</div>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={onPhotosSelected} className="hidden" />
                    <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white">Ajouter des photos</span>
                  </label>
                  {touched && (photos.length < minAlbumPhotos || !albumDivisible) && (
                    <div className="mt-2 text-xs text-red-600">Ajoutez au moins {minAlbumPhotos} photos et veillez à ce que leur nombre soit divisible par {divisor} (actuellement {photos.length}).</div>
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
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-600">Photos: {photos.length} • Minimum {minAlbumPhotos} • Doit être divisible par {divisor}</div>
                </div>
              </div>
            )}

            {/* Récap */}
            <div className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Format</span><span>{format} • {prodType === 'album' ? albumPages : pages} pages</span></div>
              {prodType === 'album' && (
                <div className="flex justify-between text-slate-600"><span>Pelliculage couverture</span><span>{coverFinish === 'brillant' ? 'Brillant' : 'Mat'}</span></div>
              )}
              <div className="flex justify-between text-slate-600"><span>Type</span><span>{prodType === 'album' ? 'Album photo' : prodType === 'magazine' ? 'Magazine (PDF)' : 'Document (PDF)'} {pdfFile ? '• PDF fourni' : ''}</span></div>
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
                title={!formValid ? 'Complétez les champs requis et ajoutez vos photos' : 'Passer à la confirmation'}
              >
                Commander
              </button>
              <a href="/polaroids" className="rounded-full border border-slate-300 px-5 py-2 text-sm hover:border-slate-400">Polaroïds</a>
              <div className="text-xs text-slate-600">Contact: +225 07 87 50 26 37 — Livraison Mercredi & Samedi ({deliveryInfo.window})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
