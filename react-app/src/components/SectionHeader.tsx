export default function SectionHeader({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
      {image && (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <div className="relative px-6 py-10 md:px-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      </div>
    </div>
  )
}
