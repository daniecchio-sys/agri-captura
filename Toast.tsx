// ui/Toast.tsx

import { useUIStore } from '../core/store/uiStore'

const STYLES = {
  ok:    'bg-campo-700 text-campo-100 border-campo-500',
  error: 'bg-red-900/90 text-red-100 border-red-700',
  info:  'bg-campo-900/90 text-campo-200 border-campo-700',
}

export function Toast() {
  const toast      = useUIStore((s) => s.toast)
  const clearToast = useUIStore((s) => s.clearToast)

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-24 left-1/2 z-50 -translate-x-1/2
        max-w-xs w-[calc(100%-2rem)] rounded-xl border px-4 py-3
        text-sm shadow-lg backdrop-blur
        transition-all duration-200
        ${STYLES[toast.type]}
      `}
      onClick={clearToast}
    >
      {toast.msg}
    </div>
  )
}
