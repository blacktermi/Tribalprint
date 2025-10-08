import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery, DELIVERY, COMMUNES, type Zone } from '../shared/delivery'
import { api, isApiConfigured } from '../lib/api/client'
import { buildOrderPayload } from '../lib/api/buildOrderPayload'
import UploadBox from '../components/UploadBox'
import { useSingleFileUpload } from '../lib/hooks/useSingleFileUpload'

export default function EtiquettePage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('') // format et quantité à définir
  const [qty, setQty] = useState(50)
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState(COMMUNES[1][0])
  const { file, setFile, uploading: uploadingFile, uploadError, uploadResult, ensureUploaded } = useSingleFileUpload()
  const [coverSrc, setCoverSrc] = useState('/img/etiquettes-cover.jpg')
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const unitPrice = 200
  const minQty = 50
  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotalItems = unitPrice * qty
  const subtotal = subtotalItems
  const discountAmount = 0
  const totalAfterDiscount = subtotal - discountAmount
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const phoneValid = useMemo(() => { const d = phone.replace(/\D/g, ''); return d.length >= 8 && d.length <= 15 }, [phone])
  const formValid = useMemo(() => fullName.trim().length > 1 && phoneValid && qty >= minQty && details.trim().length > 4, [fullName, phoneValid, qty, details])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }
  // Aperçu géré par UploadBox

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({ product: 'etiquette', details: details.trim(), qty: String(qty), unit_price: String(unitPrice), subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), zone: String(zone), commune, name: fullName.trim(), phone: phone.trim(), email: email.trim(), has_file: String(!!file), file_name: file?.name || '', file_type: file?.type || '', delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    return `/confirmation?${params.toString()}`
  }, [details, qty, unitPrice, subtotal, discountAmount, delivery, total, zone, commune, fullName, phone, email, file, deliveryInfo.iso, deliveryInfo.window])

  async function handleOrder() {
    setTouched(true)
    if (!formValid || submitting || uploadingFile) return
    if (!isApiConfigured()) {
      navigate(confirmationTo)
      return
    }
    try {
      setSubmitting(true)
      let uploaded = uploadResult
      if (file && !uploaded) {
        uploaded = await ensureUploaded()
      }
      const payload = buildOrderPayload({
        contact: { name: fullName.trim(), phone: phone.trim(), email: email.trim() || undefined },
        delivery: { zone, commune, date: deliveryInfo.iso, window: deliveryInfo.window },
        items: [
          {
            product_slug: 'etiquette',
            product_label: 'Étiquettes',
            quantity: qty,
            unit_price: unitPrice,
            options: { details: details.trim() },
          },
        ],
        uploads: uploaded ? [uploaded] : file ? [{ original_name: file.name, mime_type: file.type }] : undefined,
        pricing: { subtotal, discount: discountAmount, delivery_fee: delivery, total },
      })
      const res = await api.createOrder(payload)
      const url = new URL(confirmationTo, window.location.origin)
      const qp = url.searchParams
      if (res.ref) qp.set('ref', res.ref)
      navigate(url.pathname + '?' + qp.toString())
    } catch (e) {
      console.error('createOrder failed (etiquette), fallback:', e)
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
            <img src={coverSrc} onError={() => setCoverSrc('/img/etiquettes-cover.svg')} alt="Étiquettes personnalisées" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Étiquettes</h1>
          <p className="mt-1 text-slate-600 text-sm">Prix unitaire: 200 FCFA. Format et quantité à définir selon vos besoins. Minimum 50 ex.</p>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom et Prénom <span className="text-red-600">*</span></label>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} onBlur={() => setTouched(true)} placeholder="Ex: N'Guessan Linda" />
                {touched && fullName.trim().length <= 1 && (<div className="mt-1 text-xs text-red-600">Nom et Prénom requis.</div>)}
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone <span className="text-red-600">*</span></label>
                <input type="tel" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => setTouched(true)} placeholder="Ex: +225 07 88 99 00" />
                {touched && !phoneValid && (<div className="mt-1 text-xs text-red-600">Numéro invalide.</div>)}
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
              <label className="text-sm font-medium">Détails (format, usage, etc.) <span className="text-red-600">*</span></label>
              <textarea className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} onBlur={() => setTouched(true)} placeholder="Ex: 5 × 8 cm, rouleaux, papier adhésif, impression couleur" />
              {touched && details.trim().length <= 4 && (<div className="mt-1 text-xs text-red-600">Merci de préciser vos besoins.</div>)}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Quantité</div>
              <input type="number" min={minQty} step={10} className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm" value={qty} onChange={(e) => setQty(Math.max(minQty, parseInt(e.target.value) || minQty))} />
              <div className="text-sm text-slate-600">Min {minQty} ex</div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Fichier (image ou PDF)</div>
              <UploadBox file={file} onChange={setFile} accept="image/*,application/pdf" hint="Formats acceptés: JPG, PNG, HEIC, PDF • 1 fichier max" uploading={uploadingFile} error={uploadError} />
              {!file && (<div className="mt-1 text-xs text-slate-500">Vous pourrez aussi l’envoyer après confirmation (WhatsApp/email).</div>)}
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Zone de livraison</div>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3].map((z) => (
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
                {COMMUNES[zone].map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span>{qty} × étiquette</span><span>{subtotalItems.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <button type="button" onClick={handleOrder} disabled={!formValid || submitting || uploadingFile} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid && !submitting && !uploadingFile ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`}>{submitting ? 'Envoi…' : 'Commander'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
