// core/store/uiStore.ts
// Estado de la interfaz — NO datos de dominio.
// No se persiste: es efímero por diseño.

import { create } from 'zustand'

type ToastType = 'ok' | 'error' | 'info'

type Toast = {
  id: number
  msg: string
  type: ToastType
}

type UIState = {
  isOffline: boolean
  pendingCount: number          // eventos con syncPendiente = true
  toast: Toast | null

  setOffline:      (v: boolean) => void
  setPendingCount: (n: number) => void
  showToast:       (msg: string, type?: ToastType) => void
  clearToast:      () => void
}

let _toastId = 0

export const useUIStore = create<UIState>()((set) => ({
  isOffline:    false,
  pendingCount: 0,
  toast:        null,

  setOffline: (v) => set({ isOffline: v }),

  setPendingCount: (n) => set({ pendingCount: n }),

  showToast: (msg, type = 'info') => {
    _toastId += 1
    set({ toast: { id: _toastId, msg, type } })
    // Auto-dismiss a los 3s
    const id = _toastId
    setTimeout(() => {
      set((s) => s.toast?.id === id ? { toast: null } : {})
    }, 3000)
  },

  clearToast: () => set({ toast: null }),
}))
