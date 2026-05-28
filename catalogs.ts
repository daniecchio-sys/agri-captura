// core/types/catalogs.ts
// Catálogos en memoria — no están en DB en Fase 0
// Extensibles sin cambiar el schema

// ─── Fenología ───────────────────────────────────────────────────────────────

export type EstadioFenologia = {
  codigo: string      // "Em", "V1", "V14+", "CA", ...
  label: string
  orden: number       // para ordenar cronológicamente
  cultivo?: string    // undefined = aplica a todos los cultivos
}

// Catálogo maíz — base por defecto
export const FENOLOGIA_MAIZ: EstadioFenologia[] = [
  { codigo: 'Em',   label: 'Emergencia',              orden: 0,  cultivo: 'Maíz' },
  { codigo: 'V1',   label: 'V1 – 1 hoja collarada',  orden: 1,  cultivo: 'Maíz' },
  { codigo: 'V2',   label: 'V2 – 2 hojas',           orden: 2,  cultivo: 'Maíz' },
  { codigo: 'V3',   label: 'V3 – 3 hojas',           orden: 3,  cultivo: 'Maíz' },
  { codigo: 'V4',   label: 'V4 – 4 hojas',           orden: 4,  cultivo: 'Maíz' },
  { codigo: 'V5',   label: 'V5 – 5 hojas',           orden: 5,  cultivo: 'Maíz' },
  { codigo: 'V6',   label: 'V6 – 6 hojas',           orden: 6,  cultivo: 'Maíz' },
  { codigo: 'V7',   label: 'V7 – 7 hojas',           orden: 7,  cultivo: 'Maíz' },
  { codigo: 'V8',   label: 'V8 – 8 hojas',           orden: 8,  cultivo: 'Maíz' },
  { codigo: 'V9',   label: 'V9 – 9 hojas',           orden: 9,  cultivo: 'Maíz' },
  { codigo: 'V10',  label: 'V10 – 10 hojas',         orden: 10, cultivo: 'Maíz' },
  { codigo: 'V11',  label: 'V11 – 11 hojas',         orden: 11, cultivo: 'Maíz' },
  { codigo: 'V12',  label: 'V12 – 12 hojas',         orden: 12, cultivo: 'Maíz' },
  { codigo: 'V13',  label: 'V13 – 13 hojas',         orden: 13, cultivo: 'Maíz' },
  { codigo: 'V14+', label: 'V14+ – 14 o más hojas',  orden: 14, cultivo: 'Maíz' },
  { codigo: 'CA',   label: 'Caña',                   orden: 15, cultivo: 'Maíz' },
  { codigo: 'BFV',  label: 'Burra de flor visible',  orden: 16, cultivo: 'Maíz' },
  { codigo: 'IFL',  label: 'Inicio floración',       orden: 17, cultivo: 'Maíz' },
  { codigo: 'IFR',  label: 'Inicio fructificación',  orden: 18, cultivo: 'Maíz' },
  { codigo: 'CO',   label: 'Cosecha',                orden: 19, cultivo: 'Maíz' },
]

// Función utilitaria para obtener catálogo por cultivo
export function getFenologiaCatalogo(cultivo: string): EstadioFenologia[] {
  switch (cultivo.toLowerCase()) {
    case 'maíz':
    case 'maiz':
      return FENOLOGIA_MAIZ
    default:
      return FENOLOGIA_MAIZ // fallback hasta agregar otros cultivos
  }
}

// ─── Cultivos ────────────────────────────────────────────────────────────────

export const CULTIVOS = [
  { codigo: 'maiz',  label: 'Maíz' },
  { codigo: 'soja',  label: 'Soja' },
  { codigo: 'trigo', label: 'Trigo' },
  { codigo: 'sorgo', label: 'Sorgo' },
  { codigo: 'otro',  label: 'Otro' },
] as const

export type CultivoId = typeof CULTIVOS[number]['codigo']

// ─── Humedad comercial por especie ──────────────────────────────────────────

export type HumedadComercial = {
  cultivo: string
  pct: number
}

export const HUMEDADES_COMERCIALES: HumedadComercial[] = [
  { cultivo: 'Maíz',  pct: 14.5 },
  { cultivo: 'Soja',  pct: 13.0 },
  { cultivo: 'Trigo', pct: 14.0 },
  { cultivo: 'Sorgo', pct: 14.0 },
]

export function getHumedadComercial(cultivo: string): number | undefined {
  return HUMEDADES_COMERCIALES.find(
    h => h.cultivo.toLowerCase() === cultivo.toLowerCase()
  )?.pct
}
