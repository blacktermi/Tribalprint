// Règle: Livraisons les Mercredi et Samedi, fenêtre 14h–18h
// Si une commande est passée après 15h la veille du jour de livraison, elle est automatiquement livrée le prochain jour de livraison.

const DELIVERY_DAYS = [3, 6] as const // 0=Dimanche … 6=Samedi
const CUTOFF_HOUR = 15 // 15h
export const DELIVERY_WINDOW_LABEL = '10h–18h'

export type DeliveryInfo = {
  date: Date
  iso: string // YYYY-MM-DD
  label: string // ex: "Mercredi 08/10/2025"
  window: string // ex: "14h–18h"
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function formatISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function pad(n: number) { return n < 10 ? `0${n}` : String(n) }

function formatDisplay(d: Date) {
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const dayLabel = days[d.getDay()]
  return `${dayLabel} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function isDeliveryDay(d: Date) { return (DELIVERY_DAYS as readonly number[]).includes(d.getDay()) }

function previousDay(date: Date) { return addDays(date, -1) }

export function computeNextDelivery(nowInput?: Date): DeliveryInfo {
  const now = nowInput ? new Date(nowInput) : new Date()
  // Trouver le prochain jour de livraison >= aujourd'hui
  let candidate = startOfDay(now)
  // Si aujourd'hui n'est pas un jour de livraison, avancer jusqu'au prochain
  while (!isDeliveryDay(candidate)) {
    candidate = addDays(candidate, 1)
  }
  // Calculer la veille du candidat et vérifier le cutoff 15h
  const cutoffDay = previousDay(candidate)
  const cutoff = new Date(cutoffDay)
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0)

  // Si on est après le cutoff par rapport à ce candidat, passer au prochain jour de livraison
  if (now > cutoff) {
    // Avancer au prochain jour de livraison après candidate
    let next = addDays(candidate, 1)
    while (!isDeliveryDay(next)) {
      next = addDays(next, 1)
    }
    candidate = next
  }

  return { date: candidate, iso: formatISODate(candidate), label: formatDisplay(candidate), window: DELIVERY_WINDOW_LABEL }
}
export type Zone = 1 | 2 | 3

export const DELIVERY: Record<Zone, number> = { 1: 1500, 2: 2000, 3: 3000 }

export const COMMUNES: Record<Zone, string[]> = {
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
