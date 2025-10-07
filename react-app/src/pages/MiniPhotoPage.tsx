import CategoryBaseForm, { PackOption } from '../components/CategoryBaseForm'

const PACKS: PackOption[] = [
  { id: 'mini36', label: '36 photos (5×7,5 cm)', photoCount: 36, price: 8000 },
  { id: 'mini20', label: '20 photos (5,5×9 cm)', photoCount: 20, price: 8000 },
]

export default function MiniPhotoPage() {
  return (
    <CategoryBaseForm
      title="Mini Photo"
      productSlug="mini-photo"
      productLabel="Mini Photo"
      packOptions={PACKS}
      bannerSrc="/img/miniphoto-cover.jpg"
    />
  )
}
