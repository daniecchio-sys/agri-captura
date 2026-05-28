// core/db/schema.ts
// Define los tipos de cada tabla en Dexie.
// Separado de db.ts para importar tipos sin instanciar la DB.

import type { Campania, Ensayo, Sitio, Material, Franja, Evento } from '../types/entities'

// Re-exportamos para que el resto de la app importe desde un solo lugar
export type { Campania, Ensayo, Sitio, Material, Franja, Evento }

// Índices declarados en schema v1
// Formato: '&id' = primary key única | 'campo' = índice | '[a+b]' = índice compuesto
// REGLA: solo indexar lo que se consulta — payload nunca se indexa
export const SCHEMA_V1 = {
  campanias:   '&id, creadoEn',
  ensayos:     '&id, campaniaId, creadoEn',
  sitios:      '&id, ensayoId, creadoEn',
  materiales:  '&id, ensayoId, creadoEn',
  franjas:     '&id, sitioId, materialId, creadoEn',
  eventos:     '&id, campaniaId, ensayoId, sitioId, materialId, franjaId, modulo, fecha, syncPendiente, creadoEn',
} as const
