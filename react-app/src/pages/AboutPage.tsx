import SectionHeader from '../components/SectionHeader'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeader title="À propos de Tribal Print" subtitle="Impression personnalisée et décoration murale sur-mesure" image="/img/about-banner.jpg" />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5 bg-white">
          <h2 className="text-lg font-semibold">Notre Mission</h2>
          <p className="mt-2 text-sm text-slate-700">Tribal Print est une entreprise innovante dédiée à l'impression personnalisée et à la décoration murale sur mesure. Nous transformons vos photos et créations en véritables œuvres d’art grâce à des techniques d'impression avancées et des matériaux haut de gamme. Notre mission: sublimer chaque instant de votre vie.</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-5 bg-white">
          <h2 className="text-lg font-semibold">Pourquoi nous choisir ?</h2>
          <p className="mt-2 text-sm text-slate-700">Qualité supérieure, matériaux durables et livraison rapide en Côte d’Ivoire. Notre équipe est à l’écoute pour des créations parfaitement adaptées à vos attentes.</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5 bg-white">
        <h2 className="text-lg font-semibold">Nos Services</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          <li className="text-sm">📸 Polaroïds, mini-photos, photo carte, photo strips</li>
          <li className="text-sm">🖼 Tableaux personnalisés aluminium, bois, toiles canvas</li>
          <li className="text-sm">🎨 Posters papier, metal et affiches artistiques</li>
          <li className="text-sm">📖 Albums photos</li>
          <li className="text-sm">💳 Cartes de visite, invitations, remerciements</li>
          <li className="text-sm">📜 Flyers et plaquettes commerciales</li>
          <li className="text-sm">🎭 Autocollants et étiquettes</li>
          <li className="text-sm">☕ Personnalisation de mugs</li>
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5 bg-white">
        <h2 className="text-lg font-semibold">Nous contacter</h2>
        <div className="mt-2 text-sm text-slate-700">
          <div>Email: <a className="font-medium text-slate-900" href="mailto:info.tribalprint@gmail.com">info.tribalprint@gmail.com</a></div>
          <div>Téléphone: <a className="font-medium text-slate-900" href="tel:+2250787502637">+225 07 87 50 26 37</a></div>
        </div>
      </div>
    </div>
  )
}
