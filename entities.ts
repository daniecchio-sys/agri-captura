// core/types/entities.ts
// Jerarquía: Campaña → Ensayo → Sitio → Material → Franja → Evento

// ─── Jerarquía experimental ────────────────────────────────────────────────

export type Campania = {
  id: string
  nombre: string          // "2024/2025"
  cultivo: string         // "Maíz" | "Soja" | libre
  descripcion?: string
  temporada: string       // "2024/2025" — puede coincidir con nombre
  creadoEn: number        // timestamp ms
  actualizadoEn: number
}

export type Ensayo = {
  id: string
  campaniaId: string
  nombre: string          // "Ensayo densidades norte"
  descripcion?: string
  creadoEn: number
  actualizadoEn: number
}

export type Sitio = {
  id: string
  ensayoId: string
  nombre: string          // "Colonia Caroya"
  codigo: string          // "F1", "F2"
  descripcion?: string
  creadoEn: number
  actualizadoEn: number
}

export type Material = {
  id: string
  ensayoId: string        // catálogo a nivel ensayo, reutilizable en Franjas
  nombre: string          // "DK7210", "AX7784"
  descripcion?: string
  creadoEn: number
  actualizadoEn: number
}

export type Franja = {
  id: string
  sitioId: string
  materialId: string      // FK a Material
  numero: number          // orden dentro del sitio
  hectareas?: number
  descripcion?: string
  creadoEn: number
  actualizadoEn: number
}

// ─── Evento genérico ────────────────────────────────────────────────────────
// Todos los módulos de captura generan Eventos.
// El payload es tipado por módulo via generics.

import type { ModuloId } from './modulos'

export type Evento<T = unknown> = {
  id: string

  // Contexto desnormalizado (facilita exportación sin joins)
  campaniaId: string
  ensayoId: string
  sitioId: string
  materialId?: string     // opcional: lluvias no requieren material
  franjaId?: string       // opcional: ídem

  modulo: ModuloId
  tipo?: string           // subtipo dentro del módulo (ej: "batch", "individual")

  fecha: string           // ISO 8601 "2024-11-03"
  creadoEn: number        // timestamp ms
  actualizadoEn: number

  syncPendiente: boolean  // flag informativo — sin backend todavía

  payloadVersion: number  // para migraciones futuras de payload (empieza en 1)
  payload: T
}
