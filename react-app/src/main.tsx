import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import AppLayout from './shared/AppLayout'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'
import PhotoStripsPage from './pages/PhotoStripsPage'
import PhotoCartePage from './pages/PhotoCartePage'
import MiniPhotoPage from './pages/MiniPhotoPage'
import { Navigate } from 'react-router-dom'
import AboutPage from './pages/AboutPage'
import AlbumPhotoPage from './pages/AlbumPhotoPage'
import TableauxAluminiumPage from './pages/TableauxAluminiumPage'
import PolaroidsPage from './pages/PolaroidsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
  { path: 'a-propos', element: <AboutPage /> },
  { path: 'polaroids', element: <PolaroidsPage /> },
  { path: 'polaroidtexte', element: <PolaroidsPage /> },
  { path: 'miniphoto', element: <MiniPhotoPage /> },
  { path: 'photocarte', element: <PhotoCartePage /> },
  { path: 'photostrips', element: <PhotoStripsPage /> },
    { path: 'Albumphoto', element: <AlbumPhotoPage /> },
      { path: 'albumphoto', element: <Navigate to="/Albumphoto" replace /> },
  { path: 'tableauxpersonnaliser', element: <TableauxAluminiumPage /> },
      { path: 'Tableauxebeneprestige', element: <PlaceholderPage title="Tableaux Bois" /> },
      { path: 'canvas', element: <PlaceholderPage title="Canvas" /> },
      { path: 'posters', element: <PlaceholderPage title="Posters papier" /> },
      { path: 'metalposter', element: <PlaceholderPage title="Metal Posters" /> },
      { path: 'cartedevistite', element: <PlaceholderPage title="Carte de visite" /> },
      { path: 'carteinvitation', element: <PlaceholderPage title="Carte d\'invitation" /> },
      { path: 'carteremerciment', element: <PlaceholderPage title="Carte de remerciement" /> },
      { path: 'flyers', element: <PlaceholderPage title="Flyers" /> },
      { path: 'plaquette', element: <PlaceholderPage title="Plaquettes" /> },
      { path: 'stickers', element: <PlaceholderPage title="Stickers" /> },
      { path: 'etiquettes', element: <PlaceholderPage title="Étiquettes" /> },
      { path: 'Mug', element: <PlaceholderPage title="Mug" /> },
      // Footer / pages légales
      { path: 'politique-confidentialite', element: <PlaceholderPage title="Politique de Confidentialité" /> },
      { path: 'conditions-utilisation', element: <PlaceholderPage title="Conditions Générales" /> },
      { path: 'confirmation', element: <PlaceholderPage title="Confirmation" /> },
      // 404 fallback
      { path: '*', element: <PlaceholderPage title="Page introuvable" description="Cette page n'existe pas encore ou a été déplacée." /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
