import { NavLink } from 'react-router-dom'

type Props = {
  to: string
  img: string
  title: string
  price?: string
  badge?: string
}

export default function ProductCard({ to, img, title, price, badge }: Props) {
  return (
    <NavLink
      to={to}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-medium text-white shadow">
            {badge}
          </span>
        )}
        <button
          aria-label="Voir le produit"
          className="absolute bottom-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-900 shadow ring-1 ring-slate-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          Voir
        </button>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium text-slate-900">{title}</div>
        {price && <div className="mt-1 text-xs text-slate-600">{price}</div>}
      </div>
    </NavLink>
  )
}
