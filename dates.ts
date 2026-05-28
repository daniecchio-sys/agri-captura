// utils/dates.ts
// Helpers mínimos para fechas. La app trabaja con ISO 8601 strings en payloads
// y timestamps ms en creadoEn / actualizadoEn.

/** Fecha de hoy en formato ISO 8601 local (YYYY-MM-DD) */
export function hoy(): string {
  const d = new Date()
  return d.toLocaleDateString('sv-SE') // sv-SE produce YYYY-MM-DD nativo
}

/** Timestamp ms actual — para creadoEn / actualizadoEn */
export function ahora(): number {
  return Date.now()
}

/** Formatea fecha ISO para mostrar en UI (DD/MM/YYYY) */
export function formatFecha(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
