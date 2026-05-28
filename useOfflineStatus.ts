// core/hooks/useOfflineStatus.ts
// Detecta cambios de conectividad y los refleja en uiStore.
// Montar una sola vez en App.tsx.

import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

export function useOfflineStatus() {
  const setOffline = useUIStore((s) => s.setOffline)

  useEffect(() => {
    // Estado inicial — navigator.onLine puede ser false en PWA instalada sin red
    setOffline(!navigator.onLine)

    const handleOnline  = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])
}
