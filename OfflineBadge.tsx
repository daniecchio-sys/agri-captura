// ui/OfflineBadge.tsx
// Badge visual que informa estado de conectividad y registros pendientes.
// Solo informativo — no bloquea ninguna acción.

import { useUIStore } from '../core/store/uiStore'

export function OfflineBadge() {
  const isOffline    = useUIStore((s) => s.isOffline)
  const pendingCount = useUIStore((s) => s.pendingCount)

  if (!isOffline && pendingCount === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {isOffline && (
        <span className="flex items-center gap-1 rounded-full bg-tierra-700/80 px-2 py-0.5 text-tierra-100">
          <span className="h-1.5 w-1.5 rounded-full bg-tierra-300 animate-pulse" />
          sin red
        </span>
      )}
      {pendingCount > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-campo-800 px-2 py-0.5 text-campo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-campo-400" />
          {pendingCount} pend.
        </span>
      )}
    </div>
  )
}
