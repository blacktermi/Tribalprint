type Props = { title: string; description?: string }

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
      {description ? (
        <p className="mt-4 text-slate-700">{description}</p>
      ) : (
        <p className="mt-4 text-slate-700">Cette page est en cours de migration vers React.</p>
      )}
    </section>
  )
}
