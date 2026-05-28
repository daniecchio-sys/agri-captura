// utils/ids.ts
// Wrapper de nanoid. Tamaño 10 — suficiente para datos locales sin colisiones.
// Importar desde aquí, no desde nanoid directamente, para poder cambiar la impl.

import { nanoid } from 'nanoid'

export const newId = () => nanoid(10)
