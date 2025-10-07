import CategoryBaseForm, { PackOption } from '../components/CategoryBaseForm'

const PACKS: PackOption[] = [
  { id: 'pc6', label: 'Pack 6 photos — 14.5×14.5 cm', photoCount: 6, price: 6000 },
]

export default function PhotoCartePage() {
  return (
    <CategoryBaseForm
      title="Photo Carte"
      productSlug="photo-carte"
      productLabel="Photo Carte"
      packOptions={PACKS}
      bannerSrc="/img/photocarte-cover.jpg"
    />
  )
}
