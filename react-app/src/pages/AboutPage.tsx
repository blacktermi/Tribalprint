declare global {
  interface Window { __tribalInit?: () => void }
}

export default function AboutPage() {
  // Optionnel: relancer certains comportements globaux (back-to-top)
  // useEffect(() => window.__tribalInit?.(), [])
  return (
    <div className="about-page">
      {/* Bandeau titre */}
      <div className="newsletter" style={{ padding: '40px 0' }}>
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1>À Propos de Tribal Print</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Image bannière si dispo */}
      <div className="container my-4">
        <img src="/img/about-banner.jpg" alt="À propos Tribal Print" className="img-fluid rounded" />
      </div>

      <div className="container">
        <section className="bg-white p-4 p-md-5 rounded shadow-sm mb-4">
          <h2 className="mb-3" style={{ color: '#8B4513' }}>Notre Mission</h2>
          <p>
            Tribal Print est une entreprise innovante dédiée à l&apos;impression personnalisée et à la décoration murale sur mesure.
            Nous transformons vos photos et créations en véritables œuvres d’art en utilisant des techniques d&apos;impression avancées
            et des matériaux haut de gamme. Que ce soit pour des souvenirs intemporels, des cadeaux uniques ou la personnalisation
            de vos espaces, nous garantissons une qualité exceptionnelle, une finition soignée et une durabilité optimale. Notre mission
            est d’apporter une touche artistique et émotionnelle à vos images afin de sublimer chaque instant de votre vie.
          </p>
        </section>

        <section className="bg-white p-4 p-md-5 rounded shadow-sm mb-4">
          <h2 className="mb-3" style={{ color: '#8B4513' }}>Nos Services</h2>
          <ul className="list-unstyled">
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              📸 Impression de <strong>Polaroïds</strong>, mini-photos, Photo carte, Photos Strips
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              🖼 Création de <strong>Tableaux personnalisés</strong> en aluminium et bois et toile canvas
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              🎨 Impression de <strong>Posters papier, metal et affiches artistiques</strong>
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              📖 Fabrication de <strong>Albums photos</strong>
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              💳 Impression de <strong>Cartes de visite, invitations et remerciements</strong>
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              📜 Création de <strong>Flyers et plaquettes commerciales</strong>
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              🎭 Impression sur <strong>Autocollants et étiquettes</strong>
            </li>
            <li className="py-2 px-3 mb-2 rounded" style={{ background: '#fff7f0', fontWeight: 600 }}>
              ☕ Personnalisation de <strong>Mugs</strong>
            </li>
          </ul>
        </section>

        <section className="bg-white p-4 p-md-5 rounded shadow-sm mb-4">
          <h2 className="mb-3" style={{ color: '#8B4513' }}>Pourquoi Choisir Tribal Print ?</h2>
          <p>
            Nous garantissons une impression de qualité supérieure, des matériaux durables et un service de livraison rapide en Côte d&apos;Ivoire.
            Notre équipe est à votre écoute pour vous proposer des créations personnalisées qui correspondent à vos attentes.
          </p>
        </section>

        <section className="bg-white p-4 p-md-5 rounded shadow-sm mb-5">
          <h2 className="mb-3" style={{ color: '#8B4513' }}>Nous Contacter</h2>
          <p>
            Email : <a href="mailto:info.tribalprint@gmail.com" style={{ color: '#8B4513', fontWeight: 700 }}>info.tribalprint@gmail.com</a>
          </p>
          <p>
            Téléphone : <a href="tel:+2250787502637" style={{ color: '#8B4513', fontWeight: 700 }}>+225 07 87 50 26 37</a>
          </p>
        </section>
      </div>
    </div>
  )
}
