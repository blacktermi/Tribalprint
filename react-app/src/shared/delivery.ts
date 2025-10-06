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
