import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery, DELIVERY, COMMUNES, type Zone } from '../shared/delivery'
import UploadBox from '../components/UploadBox'

type Impression = 'recto' | 'recto-verso'

export default function CarteRemerciementPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [packs, setPacks] = useState(1) // 1 pack = 100 cartes
  const [pelliculage, setPelliculage] = useState<'mat' | 'brillant'>('mat')
  const [impression, setImpression] = useState<Impression>('recto-verso')
  const [bordsArrondis, setBordsArrondis] = useState(false)
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState(COMMUNES[1][0])
  const [file, setFile] = useState<File | null>(null)
  const [coverSrc, setCoverSrc] = useState('/img/carteremerciment-cover.jpg')
  const touched = true

  const UNIT_PACK_PRICES: Record<Impression, number> = { 'recto': 15000, 'recto-verso': 15000 }
  const unitPackPrice = UNIT_PACK_PRICES[impression]
  const arrondiOptionPerPack = 3000
  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotalPacks = unitPackPrice * packs
  const subtotalOptions = (bordsArrondis ? arrondiOptionPerPack : 0) * packs
  const subtotal = subtotalPacks + subtotalOptions
  const discountAmount = 0
  const totalAfterDiscount = subtotal - discountAmount
  const total = totalAfterDiscount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const phoneValid = useMemo(() => { const d = phone.replace(/\D/g, ''); return d.length >= 8 && d.length <= 15 }, [phone])
  const formValid = useMemo(() => fullName.trim().length > 1 && phoneValid && packs > 0, [fullName, phoneValid, packs])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }

  // Aperçu géré par UploadBox

  const confirmationTo = useMemo(() => {
  const params = new URLSearchParams({ product: 'carte-remerciement', packs: String(packs), pack_size: '100', impression, format: '10x10', pelliculage, bords_arrondis: String(bordsArrondis), zone: String(zone), commune, subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), name: fullName.trim(), phone: phone.trim(), email: email.trim(), has_file: String(!!file), file_name: file?.name || '', file_type: file?.type || '', delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    return `/confirmation?${params.toString()}`
  }, [packs, pelliculage, bordsArrondis, zone, commune, subtotal, discountAmount, delivery, total, fullName, phone, email, deliveryInfo.iso, deliveryInfo.window])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src={coverSrc} onError={() => setCoverSrc('/img/carte-remerciement-cover.svg')} alt="Cartes de remerciement" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cartes de remerciement</h1>
          <p className="mt-1 text-slate-600 text-sm">100 cartes: 15 000 FCFA. Format: 10 × 10 cm. Impression recto ou recto-verso. Pelliculage mat ou brillant. Option bords arrondis: +3 000 FCFA par pack de 100.</p>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom et Prénom <span className="text-red-600">*</span></label>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Koné Aïcha" />
                {touched && fullName.trim().length <= 1 && (<div className="mt-1 text-xs text-red-600">Nom et Prénom requis.</div>)}
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone <span className="text-red-600">*</span></label>
                <input type="tel" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +225 05 06 07 08 09" />
                {touched && !phoneValid && (<div className="mt-1 text-xs text-red-600">Numéro invalide.</div>)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Email <span className="text-slate-400">(optionnel)</span></label>
                <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: nom@exemple.com" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">Packs de 100</div>
              <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={packs} onChange={(e) => setPacks(Math.max(1, parseInt(e.target.value) || 1))}>
                {Array.from({ length: 51 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
              <div className="text-sm text-slate-600">{unitPackPrice.toLocaleString()} FCFA / pack de 100</div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">Pelliculage</div>
              {(['mat','brillant'] as const).map(p => (
                <button key={p} type="button" onClick={() => setPelliculage(p)} className={`rounded-full border px-3 py-1.5 text-sm ${pelliculage === p ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">Impression</div>
              {(['recto','recto-verso'] as const).map(m => (
                <button key={m} type="button" onClick={() => setImpression(m)} className={`rounded-full border px-3 py-1.5 text-sm ${impression === m ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>{m === 'recto' ? 'Recto simple' : 'Recto-verso'}</button>
              ))}
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Fichier (image ou PDF)</div>
              <UploadBox file={file} onChange={setFile} accept="image/*,application/pdf" hint="Formats acceptés: JPG, PNG, HEIC, PDF • 1 fichier max" />
              {!file && (<div className="mt-1 text-xs text-slate-500">Vous pourrez aussi l’envoyer après confirmation (WhatsApp/email).</div>)}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={bordsArrondis} onChange={(e) => setBordsArrondis(e.target.checked)} />
                Bords arrondis (+{arrondiOptionPerPack.toLocaleString()} FCFA / pack)
              </label>
              <div className="text-xs text-slate-500">Format: 10 × 10 cm</div>
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
              <div className="flex justify-between"><span>Packs (100)</span><span>{subtotalPacks.toLocaleString()} FCFA</span></div>
              {bordsArrondis && (<div className="flex justify-between"><span>Option bords arrondis</span><span>+{subtotalOptions.toLocaleString()} FCFA</span></div>)}
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <button type="button" onClick={() => formValid && navigate(confirmationTo)} disabled={!formValid} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white ${formValid ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed'}`}>Commander</button>
          </div>
        </div>
      </div>
    </div>
  )
}
