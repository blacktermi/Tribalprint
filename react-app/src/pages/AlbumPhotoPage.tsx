import { useEffect } from 'react'

declare global {
  interface Window { __tribalInit?: () => void }
}

export default function AlbumPhotoPage() {
  useEffect(() => {
    window.__tribalInit?.()
  }, [])
  return (
    <div className="container-fluid p-0" style={{ minHeight: '60vh' }}>
      {/* Bandeau titre */}
      <div className="newsletter" style={{ padding: '32px 0' }}>
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1>Album Photo</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Iframe Tally plein écran (comme la page statique) */}
      <div style={{ position: 'relative', width: '100%', height: '80vh' }}>
        <iframe
          src="https://tally.so/r/wg59Xl"
          title="Commande d'Album Photo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    </div>
  )
}
