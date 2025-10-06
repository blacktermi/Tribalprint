import { Link, NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-slate-900">
      {/* Header sticky minimaliste */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center gap-4">
            <NavLink to="/" className="font-bold text-lg tracking-tight">Tribal Print</NavLink>
            <div className="flex-1">
              <form role="search">
                <div className="relative">
                  <input
                    className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-[15px] outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Rechercher un produit, une catégorie..."
                  />
                  <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-800">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <NavLink to="/a-propos" className="hover:text-slate-700">À propos</NavLink>
            </nav>
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-700">
              <a className="hover:text-slate-900" href="#">Connexion</a>
              <a className="hover:text-slate-900" href="#">Inscription</a>
              <button aria-label="Favoris" className="hover:text-slate-900"><i className="far fa-heart"></i></button>
              <button aria-label="Panier" className="hover:text-slate-900"><i className="fas fa-shopping-cart"></i></button>
            </div>
          </div>
        </div>
      </header>

      {/* Ruban de catégories comme Redbubble */}
      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex flex-wrap items-center justify-center gap-8 py-3 text-base text-slate-800">
            {/* Photos (dropdown) */}
            <div className="relative group">
              <NavLink to="/polaroids" className="inline-flex items-center gap-1 hover:text-slate-900">
                PHOTOS <span className="text-xs">▾</span>
              </NavLink>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-56 rounded-md border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-30">
                <NavLink to="/polaroids" className="block rounded px-3 py-2 hover:bg-slate-100">Polaroïds</NavLink>
                <NavLink to="/polaroidtexte" className="block rounded px-3 py-2 hover:bg-slate-100">Polaroïds texte</NavLink>
                <NavLink to="/miniphoto" className="block rounded px-3 py-2 hover:bg-slate-100">Mini Photo</NavLink>
                <NavLink to="/photocarte" className="block rounded px-3 py-2 hover:bg-slate-100">Photo Carte</NavLink>
                <NavLink to="/photostrips" className="block rounded px-3 py-2 hover:bg-slate-100">Photo Strips</NavLink>
                <NavLink to="/Albumphoto" className="block rounded px-3 py-2 hover:bg-slate-100">Album photos</NavLink>
              </div>
            </div>

            {/* Tableaux (dropdown) */}
            <div className="relative group">
              <NavLink to="/tableauxpersonnaliser" className="inline-flex items-center gap-1 hover:text-slate-900">
                TABLEAUX <span className="text-xs">▾</span>
              </NavLink>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-56 rounded-md border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-30">
                <NavLink to="/tableauxpersonnaliser" className="block rounded px-3 py-2 hover:bg-slate-100">Tableaux Aluminium</NavLink>
                <NavLink to="/Tableauxebeneprestige" className="block rounded px-3 py-2 hover:bg-slate-100">Tableaux Bois</NavLink>
              </div>
            </div>

            {/* Canvas (no dropdown) */}
            <NavLink to="/canvas" className="hover:text-slate-900">CANVAS</NavLink>

            {/* Posters (dropdown) */}
            <div className="relative group">
              <NavLink to="/posters" className="inline-flex items-center gap-1 hover:text-slate-900">
                POSTERS <span className="text-xs">▾</span>
              </NavLink>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-56 rounded-md border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-30">
                <NavLink to="/posters" className="block rounded px-3 py-2 hover:bg-slate-100">Posters papier</NavLink>
                <NavLink to="/metalposter" className="block rounded px-3 py-2 hover:bg-slate-100">MetalPosters</NavLink>
              </div>
            </div>

            {/* Cartes (dropdown) */}
            <div className="relative group">
              <NavLink to="/cartedevistite" className="inline-flex items-center gap-1 hover:text-slate-900">
                CARTES <span className="text-xs">▾</span>
              </NavLink>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-64 rounded-md border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-30">
                <NavLink to="/cartedevistite" className="block rounded px-3 py-2 hover:bg-slate-100">Carte de visite</NavLink>
                <NavLink to="/carteinvitation" className="block rounded px-3 py-2 hover:bg-slate-100">Carte d'invitation</NavLink>
                <NavLink to="/carteremerciment" className="block rounded px-3 py-2 hover:bg-slate-100">Cartes de remerciement</NavLink>
              </div>
            </div>

            {/* Flyers (no dropdown) */}
            <NavLink to="/flyers" className="hover:text-slate-900">FLYERS</NavLink>

            {/* Plaquettes (no dropdown) */}
            <NavLink to="/plaquette" className="hover:text-slate-900">PLAQUETTES</NavLink>

            {/* Autocollants (dropdown) */}
            <div className="relative group">
              <NavLink to="/stickers" className="inline-flex items-center gap-1 hover:text-slate-900">
                AUTOCOLLANTS <span className="text-xs">▾</span>
              </NavLink>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-56 rounded-md border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-30">
                <NavLink to="/stickers" className="block rounded px-3 py-2 hover:bg-slate-100">Stickers</NavLink>
                <NavLink to="/etiquettes" className="block rounded px-3 py-2 hover:bg-slate-100">Étiquettes</NavLink>
              </div>
            </div>

            {/* Mug (no dropdown) */}
            <NavLink to="/Mug" className="hover:text-slate-900">MUG</NavLink>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer épuré */}
      <footer className="mt-10 border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="mb-3 font-semibold">Tribal Print</h3>
            <p className="text-slate-600">Impression photo personnalisée et décoration murale en Côte d&apos;Ivoire.</p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Liens</h3>
            <ul className="space-y-2 text-slate-700">
              <li><NavLink to="/a-propos" className="hover:text-slate-900">À propos</NavLink></li>
              <li><NavLink to="/politique-confidentialite" className="hover:text-slate-900">Politique de Confidentialité</NavLink></li>
              <li><NavLink to="/conditions-utilisation" className="hover:text-slate-900">Conditions Générales</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Contact</h3>
            <ul className="space-y-2 text-slate-700">
              <li>info.tribalprint@gmail.com</li>
              <li>+225 07 87 50 26 37</li>
              <li>+225 07 49 68 46 45</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Tribal Print — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}
