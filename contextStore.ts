// core/store/contextStore.ts
// Qué tiene seleccionado el usuario en la jerarquía Campaña → Franja.
// Persiste en sessionStorage para sobrevivir recargas en la misma sesión.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ContextState = {
  campaniaId: string | null
  ensayoId:   string | null
  sitioId:    string | null
  materialId: string | null
  franjaId:   string | null

  setCampania: (id: string | null) => void
  setEnsayo:   (id: string | null) => void
  setSitio:    (id: string | null) => void
  setMaterial: (id: string | null) => void
  setFranja:   (id: string | null) => void

  // Al cambiar un nivel, limpia todo lo que está debajo
  resetDesde: (nivel: 'campania' | 'ensayo' | 'sitio' | 'material' | 'franja') => void
}

export const useContextStore = create<ContextState>()(
  persist(
    (set) => ({
      campaniaId: null,
      ensayoId:   null,
      sitioId:    null,
      materialId: null,
      franjaId:   null,

      setCampania: (id) => set({
        campaniaId: id,
        ensayoId:   null,
        sitioId:    null,
        materialId: null,
        franjaId:   null,
      }),

      setEnsayo: (id) => set({
        ensayoId:   id,
        sitioId:    null,
        materialId: null,
        franjaId:   null,
      }),

      setSitio: (id) => set({
        sitioId:    id,
        materialId: null,
        franjaId:   null,
      }),

      setMaterial: (id) => set({
        materialId: id,
        franjaId:   null,
      }),

      setFranja: (id) => set({ franjaId: id }),

      resetDesde: (nivel) => {
        const resets: Record<typeof nivel, Partial<ContextState>> = {
          campania: { campaniaId: null, ensayoId: null, sitioId: null, materialId: null, franjaId: null },
          ensayo:   { ensayoId: null,   sitioId: null,  materialId: null, franjaId: null },
          sitio:    { sitioId: null,    materialId: null, franjaId: null },
          material: { materialId: null, franjaId: null },
          franja:   { franjaId: null },
        }
        set(resets[nivel])
      },
    }),
    {
      name: 'agri-context',
      storage: createJSONStorage(() => sessionStorage),
      // Solo persistir los IDs, no las funciones
      partialize: (s) => ({
        campaniaId: s.campaniaId,
        ensayoId:   s.ensayoId,
        sitioId:    s.sitioId,
        materialId: s.materialId,
        franjaId:   s.franjaId,
      }),
    }
  )
)
