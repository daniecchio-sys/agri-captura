// core/db/db.ts
// Instancia singleton de Dexie.
// Para agregar campos: incrementar version() y agregar upgrade() — nunca editar v1.

import Dexie, { type Table } from 'dexie'
import { SCHEMA_V1 } from './schema'
import type { Campania, Ensayo, Sitio, Material, Franja, Evento } from './schema'

class AgriDB extends Dexie {
  campanias!:  Table<Campania,  string>
  ensayos!:    Table<Ensayo,    string>
  sitios!:     Table<Sitio,     string>
  materiales!: Table<Material,  string>
  franjas!:    Table<Franja,    string>
  eventos!:    Table<Evento,    string>

  constructor() {
    super('AgriDB')

    // v1 — schema inicial — NUNCA modificar este bloque
    this.version(1).stores(SCHEMA_V1)

    // v2+ — agregar aquí cuando sea necesario, con upgrade()
    // Ejemplo:
    // this.version(2).stores({ ...SCHEMA_V1, nuevaTabla: '&id, campo' })
    //   .upgrade(tx => tx.table('eventos').toCollection().modify(e => { e.nuevoField = null }))
  }
}

// Singleton — toda la app usa esta instancia
export const db = new AgriDB()
