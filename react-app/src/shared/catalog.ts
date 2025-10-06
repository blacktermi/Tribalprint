export type Product = {
  id: string
  name: string
  path: string
  cover: string
  tags: string[]
  featured?: boolean
  category: 'tableaux' | 'posters' | 'photos' | 'cartes' | 'divers'
}

export const PRODUCTS: Product[] = [
  { id: 'aluminium', name: 'Tableaux Aluminium', path: '/tableauxpersonnaliser', cover: '/img/tableaux-cover.jpg', tags: ['tableau','aluminium','mur','metal','alu'], featured: true, category: 'tableaux' },
  { id: 'canvas', name: 'Canvas', path: '/canvas', cover: '/img/canvas-cover.jpg', tags: ['canvas','toile','mur','tableau'], featured: true, category: 'tableaux' },
  { id: 'metalposter', name: 'Metal Poster', path: '/metalposter', cover: '/img/metalposter-cover.jpg', tags: ['poster','metal','mur','deco'], featured: true, category: 'posters' },
  { id: 'bois', name: 'Tableaux Bois', path: '/Tableauxebeneprestige', cover: '/img/tableaux-bois-cover.jpg', tags: ['tableau','bois','mur'], category: 'tableaux' },
  { id: 'posters', name: 'Posters papier', path: '/posters', cover: '/img/posters-cover.jpg', tags: ['poster','papier','photo'], category: 'posters' },
  { id: 'album', name: 'Album photos', path: '/Albumphoto', cover: '/img/albumphoto-cover.jpg', tags: ['album','photo','livre'], category: 'photos' },
  { id: 'polaroids', name: 'Polaroïds', path: '/polaroids', cover: '/img/polaroid-cover.jpg', tags: ['polaroid','photo','mini'], category: 'photos' },
  { id: 'miniphoto', name: 'Mini Photo', path: '/miniphoto', cover: '/img/miniphoto-cover.jpg', tags: ['mini','photo'], category: 'photos' },
  { id: 'photocarte', name: 'Photo Carte', path: '/photocarte', cover: '/img/photocarte-cover.jpg', tags: ['photo','carte'], category: 'photos' },
  { id: 'photostrips', name: 'Photo Strips', path: '/photostrips', cover: '/img/photostrips-cover.jpg', tags: ['photo','strips','bande'], category: 'photos' },
  { id: 'mug', name: 'Mug', path: '/Mug', cover: '/img/mug-cover.jpg', tags: ['mug','tasse','cadeau'], category: 'divers' },
  { id: 'stickers', name: 'Stickers', path: '/stickers', cover: '/img/stickers-cover.jpg', tags: ['stickers','autocollants'], category: 'divers' },
  { id: 'etiquettes', name: 'Étiquettes', path: '/etiquettes', cover: '/img/etiquettes-cover.jpg', tags: ['etiquettes','autocollants'], category: 'divers' },
  { id: 'flyers', name: 'Flyers', path: '/flyers', cover: '/img/flyers-cover.jpg', tags: ['flyers'], category: 'divers' },
  { id: 'plaquette', name: 'Plaquettes', path: '/plaquette', cover: '/img/plaquette-cover.jpg', tags: ['plaquette','brochure'], category: 'divers' },
]

export const CATEGORIES: { key: Product['category']; label: string }[] = [
  { key: 'tableaux', label: 'Tableaux' },
  { key: 'posters', label: 'Affiches' },
  { key: 'photos', label: 'Photos' },
  { key: 'cartes', label: 'Cartes' },
  { key: 'divers', label: 'Divers' },
]
