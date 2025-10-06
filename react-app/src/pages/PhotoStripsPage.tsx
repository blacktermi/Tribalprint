import CategoryBaseForm, { PackOption } from '../components/CategoryBaseForm'

const PACKS: PackOption[] = [
  { id: 'ps_8bandes_32', label: '8 bandes (32 photos) — 4 poses', photoCount: 32, price: 8000 },
]

export default function PhotoStripsPage() {
  return (
    <CategoryBaseForm
      title="Photo Strips"
      packOptions={PACKS}
      bannerSrc="/img/photostrips-cover.jpg"
    />
  )
}
