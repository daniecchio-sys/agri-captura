// core/types/modulos.ts

// ─── IDs de módulo ──────────────────────────────────────────────────────────
// Fase 2 incluido como tipo pero sin implementación todavía
export type ModuloId =
  | 'fenologia'
  | 'stand'
  | 'lluvias'
  | 'cosecha'
  | 'recorrida_sanitaria'   // Fase 2 — tipado, no implementado
  | 'malezas'               // Fase 2 — tipado, no implementado
  | 'fertilizacion'         // Post-MVP
  | 'fitosanitarios'        // Post-MVP
  | 'riego'                 // Post-MVP

// ─── Metadata de módulo ─────────────────────────────────────────────────────
// Gobierna navegación, validaciones, exportación y filtros
export type NivelCaptura = 'franja' | 'sitio' | 'ensayo'

export type MetadataModulo = {
  id: ModuloId
  nombre: string
  nivelCaptura: NivelCaptura
  requiereMaterial: boolean   // false = lluvias, recorrida a nivel sitio
  requiereFranja: boolean     // false = lluvias
  requiereSubmuestras: boolean
  implementado: boolean
  fase: 0 | 1 | 2 | 3 | 4    // fase de implementación del roadmap
}

export const MODULOS: MetadataModulo[] = [
  {
    id: 'fenologia',
    nombre: 'Fenología',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: false,
    implementado: false,
    fase: 1,
  },
  {
    id: 'stand',
    nombre: 'Stand de plantas',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: true,
    implementado: false,
    fase: 1,
  },
  {
    id: 'lluvias',
    nombre: 'Lluvias',
    nivelCaptura: 'sitio',
    requiereMaterial: false,
    requiereFranja: false,
    requiereSubmuestras: false,
    implementado: false,
    fase: 1,
  },
  {
    id: 'cosecha',
    nombre: 'Cosecha / Postcosecha',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: true,
    implementado: false,
    fase: 3,
  },
  {
    id: 'recorrida_sanitaria',
    nombre: 'Recorrida sanitaria',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: false,
    implementado: false,
    fase: 2,
  },
  {
    id: 'malezas',
    nombre: 'Malezas',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: false,
    implementado: false,
    fase: 2,
  },
  {
    id: 'fertilizacion',
    nombre: 'Fertilización',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: false,
    implementado: false,
    fase: 4,
  },
  {
    id: 'fitosanitarios',
    nombre: 'Fitosanitarios',
    nivelCaptura: 'franja',
    requiereMaterial: true,
    requiereFranja: true,
    requiereSubmuestras: false,
    implementado: false,
    fase: 4,
  },
  {
    id: 'riego',
    nombre: 'Riego',
    nivelCaptura: 'sitio',
    requiereMaterial: false,
    requiereFranja: false,
    requiereSubmuestras: false,
    implementado: false,
    fase: 4,
  },
]

// ─── Payloads tipados por módulo ────────────────────────────────────────────
// payloadVersion: 1 en todos — incrementar solo al cambiar el shape

export type PayloadFenologia = {
  estadio: string             // código del catálogo (ej: "V6", "IFL")
  observacion?: string
}

export type PayloadStand = {
  plantasPorM2: number
  metodoConteo: 'manual' | 'estimado'
  submuestras?: number[]      // lecturas individuales si requiereSubmuestras
  observacion?: string
}

export type PayloadLluvia = {
  mm: number
  duracionMin?: number
  observacion?: string
}

export type PayloadCosecha = {
  rendimientoKgHa: number
  humedadPct: number
  humedadAjustadaPct?: number   // corregida a humedad comercial
  pesoPorPlanta?: number
  submuestras?: number[]
  observacion?: string
}
