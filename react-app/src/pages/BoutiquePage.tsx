import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

type Product = {
  id: string
  name: string
  path: string
  cover: string
  tags: string[]
  featured?: boolean
}

const PRODUCTS: Product[] = [
  { id: 'aluminium', name: 'Tableaux Aluminium', path: '/tableauxpersonnaliser', cover: '/img/tableaux-cover.jpg', tags: ['tableau','aluminium','mur','metal','alu'], featured: true },
  { id: 'canvas', name: 'Canvas', path: '/canvas', cover: '/img/canvas-cover.jpg', tags: ['canvas','toile','mur','tableau'], featured: true },
  { id: 'metalposter', name: 'Metal Poster', path: '/metalposter', cover: '/img/metalposter-cover.jpg', tags: ['poster','metal','mur','deco'], featured: true },
  { id: 'bois', name: 'Tableaux Bois', path: '/Tableauxebeneprestige', cover: '/img/tableaux-bois-cover.jpg', tags: ['tableau','bois','mur'] },
  { id: 'posters', name: 'Posters papier', path: '/posters', cover: '/img/posters-cover.jpg', tags: ['poster','papier','photo'] },
  { id: 'album', name: 'Album photos', path: '/Albumphoto', cover: '/img/albumphoto-cover.jpg', tags: ['album','photo','livre'] },
  { id: 'polaroids', name: 'Polaroïds', path: '/polaroids', cover: '/img/polaroid-cover.jpg', tags: ['polaroid','photo','mini'] },
  { id: 'miniphoto', name: 'Mini Photo', path: '/miniphoto', cover: '/img/miniphoto-cover.jpg', tags: ['mini','photo'] },
  { id: 'photocarte', name: 'Photo Carte', path: '/photocarte', cover: '/img/photocarte-cover.jpg', tags: ['photo','carte'] },
  { id: 'photostrips', name: 'Photo Strips', path: '/photostrips', cover: '/img/photostrips-cover.jpg', tags: ['photo','strips','bande'] },
]

export default function BoutiquePage() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()

  const featured = useMemo(() => PRODUCTS.filter(p => p.featured), [])
  const all = useMemo(() => PRODUCTS, [])

  const filtered = useMemo(() => {
    if (!q) return all
    return all.filter(p => {
      const hay = (p.name + ' ' + p.tags.join(' ')).toLowerCase()
      return hay.includes(q)
    })
  }, [q, all])

  const hasQuery = q.length > 0
  const title = hasQuery ? `Résultats pour « ${q} »` : 'Tous les produits'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Boutique</h1>
      {!hasQuery && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">En avant</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(p => (<ProductCard key={p.id} product={p} />))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">{title}</h2>
        {filtered.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">Aucun résultat. Essayez d’autres mots-clés (ex: tableau, canvas, poster, album…).</div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={product.path} className="group overflow-hidden rounded-xl border border-slate-200 hover:shadow-sm transition">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img src={product.cover} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="p-3">
        <div className="font-medium">{product.name}</div>
      </div>
    </Link>
  )
}
