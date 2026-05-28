// app/Router.tsx
// Rutas declarativas. En Fase 0 todas las páginas son placeholders.
// Cada feature importará su propio componente de página.

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { PlaceholderPage } from '../ui/PlaceholderPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Redirect raíz → campanias
      { index: true, element: <Navigate to="/campanias" replace /> },

      // ── Jerarquía experimental ────────────────────────────────────────────
      { path: 'campanias',                element: <PlaceholderPage titulo="Campañas"   descripcion="Lista de campañas — Fase 0 Paso 5" /> },
      { path: 'campanias/:campaniaId',    element: <PlaceholderPage titulo="Campaña"    descripcion="Detalle campaña / ensayos" /> },
      { path: 'ensayos/:ensayoId',        element: <PlaceholderPage titulo="Ensayo"     descripcion="Detalle ensayo / sitios / materiales" /> },
      { path: 'sitios/:sitioId',          element: <PlaceholderPage titulo="Sitio"      descripcion="Detalle sitio / franjas" /> },
      { path: 'franjas/:franjaId',        element: <PlaceholderPage titulo="Franja"     descripcion="Hub de módulos de captura" /> },

      // ── Módulos de captura (Fase 1) ───────────────────────────────────────
      { path: 'franjas/:franjaId/fenologia', element: <PlaceholderPage titulo="Fenología"    descripcion="Fase 1" /> },
      { path: 'franjas/:franjaId/stand',     element: <PlaceholderPage titulo="Stand"        descripcion="Fase 1" /> },
      { path: 'sitios/:sitioId/lluvias',     element: <PlaceholderPage titulo="Lluvias"      descripcion="Fase 1" /> },

      // ── Módulos Fase 3 ────────────────────────────────────────────────────
      { path: 'franjas/:franjaId/cosecha',   element: <PlaceholderPage titulo="Cosecha"      descripcion="Fase 3" /> },

      // ── Captura (acceso rápido desde nav) ────────────────────────────────
      { path: 'captura',    element: <PlaceholderPage titulo="Captura"   descripcion="Selección de contexto y módulo" /> },
      { path: 'historial',  element: <PlaceholderPage titulo="Historial" descripcion="Listado de eventos registrados" /> },
      { path: 'ajustes',    element: <PlaceholderPage titulo="Ajustes"   descripcion="Configuración y exportación" /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
