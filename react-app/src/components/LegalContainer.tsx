export default function LegalContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-slate prose-sm max-w-none">
        {children}
      </div>
    </div>
  )
}
