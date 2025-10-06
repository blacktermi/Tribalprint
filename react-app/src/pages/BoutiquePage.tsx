import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PRODUCTS, CATEGORIES, type Product } from '../shared/catalog'

export default function BoutiquePage() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()

  const EXCLUDED_IDS = useMemo(() => new Set(['album','polaroids','miniphoto','photocarte','photostrips']), [])
  const featured = useMemo(() => PRODUCTS.filter(p => p.featured && !EXCLUDED_IDS.has(p.id)), [EXCLUDED_IDS])
  const all = useMemo(() => PRODUCTS.filter(p => !EXCLUDED_IDS.has(p.id)), [EXCLUDED_IDS])

  const [cat, sortBy] = [params.get('cat') as Product['category'] | null, params.get('sort')]

  const filtered = useMemo(() => {
    let res = all
    if (q) {
      res = res.filter(p => {
        const hay = (p.name + ' ' + p.tags.join(' ')).toLowerCase()
        return hay.includes(q)
      })
    }
    if (cat && CATEGORIES.some(c => c.key === cat)) res = res.filter(p => p.category === cat)
    if (sortBy === 'name') res = [...res].sort((a, b) => a.name.localeCompare(b.name))
    return res
  }, [q, all, cat, sortBy])

  const hasQuery = q.length > 0
  const title = hasQuery ? `Résultats pour « ${q} »` : 'En avant'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Boutique</h1>
      {/* En avant en premier */}
      {!hasQuery && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">En avant</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(p => (<ProductCard key={p.id} product={p} />))}
          </div>
        </div>
      )}
      {/* Sections MC / TB / MT en bas sur toute la largeur */}
      {!hasQuery && (
        <div className="mt-8 space-y-8">
          <StockSection title="MC — Metal Posters en stock" items={[1,2,3,4,5,6].map(n => ({src: `/img/MC${n}.jpg`, to: `/boutique/stock/metal/MC${n}`}))} />
          <StockSection title="TB — Tableaux Bois en stock" items={[1,2,3,4,5,6].map(n => ({src: `/img/TB${n}.jpg`, to: `/boutique/stock/bois/TB${n}`}))} />
          <StockSection title="MT — Tableaux Aluminium en stock" items={[1,2,3,4,5,6].map(n => ({src: `/img/MT-${n}.jpg`, to: `/boutique/stock/aluminium/MT-${n}`}))} />
        </div>
      )}

      {hasQuery && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex items-center gap-2 text-sm">
              <select className="rounded-md border border-slate-300 px-2 py-1" value={cat || ''} onChange={(e) => {
                const v = e.target.value
                const url = new URL(window.location.href)
                if (v) url.searchParams.set('cat', v); else url.searchParams.delete('cat')
                window.history.replaceState({}, '', url.toString())
              }}>
                <option value="">Toutes catégories</option>
                {CATEGORIES.map(c => (<option key={c.key} value={c.key}>{c.label}</option>))}
              </select>
              <select className="rounded-md border border-slate-300 px-2 py-1" value={sortBy || ''} onChange={(e) => {
                const v = e.target.value
                const url = new URL(window.location.href)
                if (v) url.searchParams.set('sort', v); else url.searchParams.delete('sort')
                window.history.replaceState({}, '', url.toString())
              }}>
                <option value="">Tri</option>
                <option value="name">Nom (A→Z)</option>
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">Aucun résultat. Essayez d’autres mots-clés (ex: tableau, canvas, poster…).</div>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(p => (<ProductCard key={p.id} product={p} />))}
            </div>
          )}
        </div>
      )}
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

function StockSection({ title, items }: { title: string; items: { src: string; to: string }[] }) {
  return (
    <div>
      <div className="mb-2 text-base font-semibold text-slate-800">{title}</div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((it) => (
          <Link key={it.to} to={it.to} className="block overflow-hidden rounded-lg border border-slate-200 hover:shadow-sm">
            <img src={it.src} alt={title} className="aspect-[3/4] w-full object-cover" />
          </Link>
        ))}
      </div>
    </div>
  )
}
