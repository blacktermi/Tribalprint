import { NavLink } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <HeroCarousel />

      {/* Grille catégories */}
      <section className="pb-2">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Catégories populaires</h2>
          <NavLink to="/polaroids" className="text-xs text-slate-600 hover:text-slate-900">Tout voir</NavLink>
        </div>
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
          {[
            { img: '/img/polaroid-cover.jpg', title: 'Polaroïds', to: '/polaroids', badge: 'Best-seller' },
            { img: '/img/albumphoto-cover.jpg', title: 'Album Photo', to: '/Albumphoto', badge: 'Nouveau' },
            { img: '/img/tableaux-cover.jpg', title: 'Tableaux', to: '/tableauxpersonnaliser' },
            { img: '/img/posters-cover.jpg', title: 'Posters', to: '/posters' },
            { img: '/img/metalposter-cover.jpg', title: 'Metal Poster', to: '/metalposter' },
            { img: '/img/canvas-cover.jpg', title: 'Canvas', to: '/canvas' },
            { img: '/img/mug-cover.jpg', title: 'Mug', to: '/Mug' },
            { img: '/img/stickers-cover.jpg', title: 'Stickers', to: '/stickers' },
          ].map((c) => (
            <CategoryCard key={c.to} to={c.to} img={c.img} title={c.title} badge={(c as any).badge} />
          ))}
        </div>
      </section>

      {/* Sélection produits */}
      <section className="py-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Sélection du moment</h2>
          <NavLink to="/polaroids" className="text-xs text-slate-600 hover:text-slate-900">Tout voir</NavLink>
        </div>
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
          {[
            { img: '/img/Pola.webp', title: 'Pack Polaroïds x20', price: '5.000 Fcfa', to: '/polaroids', badge: 'Promo' },
            { img: '/img/ALB.webp', title: 'Album Photo Polaroïds', price: '15.000 Fcfa', to: '/Albumphoto' },
            { img: '/img/Mug.webp', title: 'Mug personnalisé', price: '10.000 Fcfa', to: '/Mug' },
            { img: '/img/Mini.webp', title: 'Mini photo x20', price: '8.000 Fcfa', to: '/miniphoto' },
          ].map((p) => (
            <ProductCard key={p.to} to={p.to} img={p.img} title={p.title} price={p.price} badge={(p as any).badge} />
          ))}
        </div>
      </section>
    </div>
  )
}
