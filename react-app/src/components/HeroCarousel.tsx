import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

type Slide = {
  title: string
  subtitle: string
  ctas: { label: string; to: string; style?: 'primary' | 'secondary' }[]
  img: string
  alt: string
}

const slides: Slide[] = [
  {
    title: 'Personnalisez vos souvenirs en beauté',
    subtitle:
      "Polaroïds, tableaux, posters, albums, mugs et plus encore. Une sélection soignée, une livraison rapide.",
    ctas: [
      { label: 'Découvrir les Polaroïds', to: '/polaroids', style: 'primary' },
      { label: 'Tableaux', to: '/tableauxpersonnaliser', style: 'secondary' },
    ],
    img: '/img/banner.jpg',
    alt: 'Impression photo grand format',
  },
  {
    title: 'Votre imprimeur en ligne',
    subtitle: 'Posters, cartes et plus — qualité premium, expédition rapide.',
    ctas: [
      { label: 'Posters', to: '/posters', style: 'primary' },
      { label: 'Cartes', to: '/cartedevistite', style: 'secondary' },
    ],
    img: '/img/posters-cover.jpg',
    alt: 'Posters de qualité',
  },
  {
    title: 'Sublimez vos murs',
    subtitle: 'Tableaux Aluminium & Bois pour une déco durable et élégante.',
    ctas: [
      { label: 'Tableaux Aluminium', to: '/tableauxpersonnaliser', style: 'primary' },
      { label: 'Tableaux Bois', to: '/Tableauxebeneprestige', style: 'secondary' },
    ],
    img: '/img/tableaux-cover.jpg',
    alt: 'Tableaux muraux',
  },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    timeoutRef.current && window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [index, paused])

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length)

  return (
    <section className="py-14">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, idx) => (
            <div key={idx} className="min-w-full">
              <div className="grid gap-10 md:grid-cols-2 items-center p-8 md:p-14">
                <div className="md:pr-6">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                    {s.title}
                  </h1>
                  <p className="mt-3 text-slate-600">{s.subtitle}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {s.ctas.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={
                          c.style === 'secondary'
                            ? 'rounded-full border border-slate-300 px-5 py-2 text-sm hover:border-slate-400'
                            : 'rounded-full bg-slate-900 px-5 py-2 text-white hover:bg-slate-800 text-sm'
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                  <img src={s.img} alt={s.alt} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button
          aria-label="Slide précédent"
          onClick={() => goTo(index - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow ring-1 ring-slate-200 hover:bg-white"
        >
          <i className="fas fa-chevron-left" />
        </button>
        <button
          aria-label="Slide suivant"
          onClick={() => goTo(index + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow ring-1 ring-slate-200 hover:bg-white"
        >
          <i className="fas fa-chevron-right" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller au slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
