import { NavLink } from 'react-router-dom'

type Props = {
  to: string
  img: string
  title: string
  badge?: string
}

export default function CategoryCard({ to, img, title, badge }: Props) {
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
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow">
            {badge}
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium text-slate-900">{title}</div>
      </div>
    </NavLink>
  )
}
