import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeNextDelivery, DELIVERY, COMMUNES, type Zone } from '../shared/delivery'
import UploadBox from '../components/UploadBox'

export default function MugPage() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState<'standard' | 'magique'>('standard')
  const [qty, setQty] = useState(1)
  const [zone, setZone] = useState<Zone>(1)
  const [commune, setCommune] = useState(COMMUNES[1][0])
  const [file, setFile] = useState<File | null>(null)
  const [coverSrc, setCoverSrc] = useState('/img/mug-cover.jpg')

  const unitPrice = variant === 'standard' ? 10000 : 15000
  const delivery = useMemo(() => DELIVERY[zone], [zone])
  const subtotal = unitPrice * qty
  const discountAmount = 0
  const total = subtotal - discountAmount + delivery
  const deliveryInfo = useMemo(() => computeNextDelivery(), [])
  const updateZone = (z: Zone) => { setZone(z); setCommune(COMMUNES[z][0]) }

  const confirmationTo = useMemo(() => {
    const params = new URLSearchParams({ product: 'mug', variant, qty: String(qty), unit_price: String(unitPrice), subtotal: String(subtotal), discount: String(discountAmount), delivery: String(delivery), total: String(total), zone: String(zone), commune, has_file: String(!!file), file_name: file?.name || '', file_type: file?.type || '', delivery_date: deliveryInfo.iso, delivery_window: deliveryInfo.window })
    return `/confirmation?${params.toString()}`
  }, [variant, qty, unitPrice, subtotal, discountAmount, delivery, total, zone, commune, file, deliveryInfo.iso, deliveryInfo.window])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img src={coverSrc} onError={() => setCoverSrc('/img/mug-cover.jpg')} alt="Mug personnalisé" className="w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mug personnalisé</h1>
          <p className="mt-1 text-slate-600 text-sm">Deux variantes: Standard (10 000 FCFA) et Magique (15 000 FCFA).</p>

          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium">Modèle</div>
              {(['standard','magique'] as const).map(v => (
                <button key={v} type="button" onClick={() => setVariant(v)} className={`rounded-full border px-3 py-1.5 text-sm ${variant === v ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 hover:border-slate-400'}`}>{v === 'standard' ? 'Standard — 10 000' : 'Magique — 15 000' } FCFA</button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Quantité</div>
              <input type="number" min={1} step={1} className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Fichier (image ou PDF)</div>
              <UploadBox file={file} onChange={setFile} accept="image/*,application/pdf" hint="Formats acceptés: JPG, PNG, HEIC, PDF • 1 fichier max" />
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
              <div className="flex justify-between"><span>{qty} × {variant === 'standard' ? 'Mug standard' : 'Mug magique'}</span><span>{subtotal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between"><span>Livraison (zone {zone})</span><span>{delivery.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-slate-600"><span>Date de livraison</span><span><strong>{deliveryInfo.label.split(' ')[0]}</strong> {deliveryInfo.label.split(' ').slice(1).join(' ')} • {deliveryInfo.window}</span></div>
              <div className="flex justify-between text-slate-600"><span>Commune</span><span>{commune}</span></div>
              <div className="mt-2 border-t pt-2 flex justify-between font-semibold text-slate-900"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
              {total > 20000 && (<div className="flex justify-between text-slate-800"><span>Acompte (30%) à régler</span><span>{Math.round(total * 0.30).toLocaleString()} FCFA</span></div>)}
            </div>

            <button type="button" onClick={() => navigate(confirmationTo)} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">Commander</button>
          </div>
        </div>
      </div>
    </div>
  )
}
