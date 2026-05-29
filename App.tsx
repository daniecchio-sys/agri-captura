import { useState, useEffect } from 'react'

// =========================
// CATÁLOGOS
// =========================

const CAMPANIAS = ['2026/2027']

const ENSAYOS_POR_CAMPANIA: Record<string, string[]> = {
  '2026/2027': ['Brassicáceas'],
}

const SITIOS_DATA = [
  { id: 'cc', nombre: 'Colonia Caroya', franjas: ['F1', 'F2'] as string[] | null },
  { id: 'pq', nombre: 'Piquillín',      franjas: null                             },
]

const MATERIALES_POR_SITIO: Record<string, string[]> = {
  cc: [
    'COLZA DIAMOND',
    'COLZA NUOLA',
    'COLZA CERES',
    'COLZA TROPHY',
    'COLZA DSV DRAGO',
    'CARINATA NUJET 350',
  ],
  pq: [
    'CAMELINA',
    'COLZA DIAMOND',
    'COLZA NUOLA',
    'COLZA CERES',
    'COLZA TROPHY',
    'CARINATA NUJET 350',
  ],
}

const FENOLOGIA_CAT = [
  { codigo: 'Em',   label: 'Emergencia' },
  { codigo: 'V1',   label: '1 hoja verdadera desplegada' },
  { codigo: 'V2',   label: '2 hojas verdaderas desplegadas' },
  { codigo: 'V3',   label: '3 hojas verdaderas desplegadas' },
  { codigo: 'V4',   label: '4 hojas verdaderas desplegadas' },
  { codigo: 'V5',   label: '5 hojas verdaderas desplegadas' },
  { codigo: 'V6',   label: '6 hojas verdaderas desplegadas' },
  { codigo: 'V7',   label: '7 hojas verdaderas desplegadas' },
  { codigo: 'V8',   label: '8 hojas verdaderas desplegadas' },
  { codigo: 'V9',   label: '9 hojas verdaderas desplegadas' },
  { codigo: 'V10',  label: '10 hojas verdaderas desplegadas' },
  { codigo: 'V11',  label: '11 hojas verdaderas desplegadas' },
  { codigo: 'V12',  label: '12 hojas verdaderas desplegadas' },
  { codigo: 'V13',  label: '13 hojas verdaderas desplegadas' },
  { codigo: 'V14+', label: '14 o más hojas verdaderas desplegadas' },
  { codigo: 'CA',   label: 'Cambio de ápice' },
  { codigo: 'BFV',  label: 'Botón floral visible' },
  { codigo: 'IFL',  label: 'Inicio de floración' },
  { codigo: 'IFR',  label: 'Inicio de fructificación' },
  { codigo: 'CO',   label: 'Cosecha' },
]

// =========================
// TIPOS
// =========================

type Sitio = { id: string; nombre: string; franjas: string[] | null }

type Estadio = { codigo: string; label: string }

type Pantalla = 'contexto' | 'modulos' | 'fenologia' | 'fenologia-ok' | 'stand' | 'stand-ok' | 'lluvia' | 'lluvia-ok' | 'cosecha' | 'cosecha-ok'

type RegistroFenologia = {
  modulo:      'fenologia'
  campania:    string
  ensayo:      string
  sitioId:     string
  sitioNombre: string
  fecha:       string
  material:    string
  codigo:      string
  label:       string
}

// Un registro = una submuestra de un material (granularidad mínima para análisis)
type RegistroStand = {
  modulo:          'stand'
  campania:        string
  ensayo:          string
  sitioId:         string
  sitioNombre:     string
  franja:          string
  material:        string
  submuestra:      number   // 1, 2, 3... índice dentro del material
  plantasLogradas: number
  observaciones?:  string
  fecha:           string
  timestamp:       number   // ms — permite agrupar un batch completo
}

type RegistroLluvia = {
  modulo:         'lluvia'
  campania:       string
  ensayo:         string
  sitioId:        string
  sitioNombre:    string
  fecha:          string
  lluviaMm:       number
  observaciones?: string
  timestamp:      number
}

type RegistroCosecha = {
  modulo:                             'cosecha'
  campania:                           string
  ensayo:                             string
  sitioId:                            string
  sitioNombre:                        string
  franja:                             string
  material:                           string
  fechaCosecha:                       string
  largoFranjaM:                       number
  numeroSurcosCosechados:             number
  distanciaEntreSurcosCm:             number   // ingresado por el usuario
  distanciaEntreSurcosM:              number   // calculado: cm / 100
  anchoFranjaM:                       number   // calculado: surcos × distanciaM
  superficieM2:                       number
  pesoHumedoKg:                       number
  rendimientoHumedoKgHa:              number
  humedadMuestraPct?:                 number
  humedadComercializacionPct?:        number
  rendimientoBaseHumedadComercialKgHa?: number
  pmgS1?:                             number
  pmgS2?:                             number
  pmgS3?:                             number
  pmgPromedio?:                       number
  peso100S1?:                         number   // gramos, ingresado por el usuario
  peso100S2?:                         number
  peso100S3?:                         number
  timestamp:                          number
}

type RegistroObservacionFenologia = {
  modulo:             'observacion_fenologia'
  campania:           string
  ensayo:             string
  sitioId:            string
  sitioNombre:        string
  material:           string
  franja:             string
  fecha:              string
  estadioFenologico?: string
  danoHelada?:        string
  fitotoxicidad?:     string
  herbicidas?:        string
  plagas?:            string
  enfermedades?:      string
  timestamp:          number
}

type RegistroSesion =
  | RegistroFenologia
  | RegistroStand
  | RegistroLluvia
  | RegistroCosecha
  | RegistroObservacionFenologia

// Estado interno del formulario Stand (no persiste, solo en memoria)
type StandEntry = { vals: string[]; obs: string }

// =========================
// HELPERS
// =========================

function hoy(): string {
  return new Date().toLocaleDateString('sv-SE')
}

function fmtFecha(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Promedio de valores string → string display. Ignora vacíos y no numéricos.
function promedio(vals: string[]): string {
  const nums = vals.filter(v => v.trim() !== '' && !isNaN(Number(v))).map(Number)
  if (nums.length === 0) return '—'
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
}

// Normaliza coma→punto y retorna number | null
function parseNum(s: string): number | null {
  if (s.trim() === '') return null
  const n = Number(s.replace(',', '.'))
  return isNaN(n) ? null : n
}

// Humedad de comercialización por especie, inferida del nombre del material
function humedadComercialPorMaterial(mat: string): number {
  const m = mat.toUpperCase()
  if (m.includes('CAMELINA')) return 7.0
  return 8.5   // COLZA y CARINATA
}

// Escapa un valor para CSV con separador ;
function csvEsc(v: unknown): string {
  if (v === undefined || v === null) return ''
  const s = String(v)
  return (s.includes(';') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"` : s
}

function exportarCSV(registros: RegistroSesion[]): void {
  if (registros.length === 0) return

  // Columnas en orden — todas las filas las tienen (vacío si no aplica al módulo)
  const COLS = [
    'modulo', 'campania', 'ensayo', 'sitioId', 'sitioNombre',
    'franja', 'material', 'fecha', 'timestamp',
    // fenología
    'codigo', 'label',
    // observación fenología
    'estadioFenologico', 'danoHelada', 'fitotoxicidad', 'herbicidas', 'plagas', 'enfermedades',
    // stand
    'submuestra', 'plantasLogradas', 'observaciones', 'promedioMaterial',
    // lluvia
    'lluviaMm',
    // cosecha
    'fechaCosecha', 'largoFranjaM', 'numeroSurcosCosechados',
    'distanciaEntreSurcosCm', 'distanciaEntreSurcosM', 'anchoFranjaM',
    'superficieM2', 'pesoHumedoKg', 'rendimientoHumedoKgHa',
    'humedadMuestraPct', 'humedadComercializacionPct',
    'rendimientoBaseHumedadComercialKgHa',
    'peso100S1', 'peso100S2', 'peso100S3',
    'pmgS1', 'pmgS2', 'pmgS3', 'pmgPromedio',
  ]

  // Promedios de Stand: agrupar por timestamp + material para calcular promedio por lote
  const standGrupos: Record<string, number[]> = {}
  registros.forEach(r => {
    if (r.modulo === 'stand') {
      const k = `${r.timestamp}_${r.material}`
      ;(standGrupos[k] = standGrupos[k] ?? []).push(r.plantasLogradas)
    }
  })
  const standProm: Record<string, string> = {}
  Object.entries(standGrupos).forEach(([k, vals]) => {
    standProm[k] = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  })

  const rows: string[] = [COLS.join(';')]

  registros.forEach(r => {
    const base: Record<string, unknown> = {
      modulo:      r.modulo,
      campania:    r.campania,
      ensayo:      r.ensayo,
      sitioId:     r.sitioId,
      sitioNombre: r.sitioNombre,
      franja:      'franja'   in r ? (r as { franja?: string }).franja   ?? '' : '',
      material:    'material' in r ? (r as { material?: string }).material ?? '' : '',
      fecha:       r.fecha,
      timestamp:   r.timestamp,
    }

    if (r.modulo === 'fenologia') {
      base.codigo = r.codigo
      base.label  = r.label
    } else if (r.modulo === 'observacion_fenologia') {
      base.estadioFenologico = r.estadioFenologico ?? ''
      base.danoHelada        = r.danoHelada        ?? ''
      base.fitotoxicidad     = r.fitotoxicidad     ?? ''
      base.herbicidas        = r.herbicidas        ?? ''
      base.plagas            = r.plagas            ?? ''
      base.enfermedades      = r.enfermedades      ?? ''
    } else if (r.modulo === 'stand') {
      base.submuestra       = r.submuestra
      base.plantasLogradas  = r.plantasLogradas
      base.observaciones    = r.observaciones ?? ''
      base.promedioMaterial = standProm[`${r.timestamp}_${r.material}`] ?? ''
    } else if (r.modulo === 'lluvia') {
      base.lluviaMm      = r.lluviaMm
      base.observaciones = r.observaciones ?? ''
    } else if (r.modulo === 'cosecha') {
      base.fechaCosecha                        = r.fechaCosecha
      base.largoFranjaM                        = r.largoFranjaM
      base.numeroSurcosCosechados              = r.numeroSurcosCosechados
      base.distanciaEntreSurcosCm              = r.distanciaEntreSurcosCm
      base.distanciaEntreSurcosM               = r.distanciaEntreSurcosM
      base.anchoFranjaM                        = r.anchoFranjaM
      base.superficieM2                        = r.superficieM2
      base.pesoHumedoKg                        = r.pesoHumedoKg
      base.rendimientoHumedoKgHa               = r.rendimientoHumedoKgHa
      base.humedadMuestraPct                   = r.humedadMuestraPct              ?? ''
      base.humedadComercializacionPct          = r.humedadComercializacionPct     ?? ''
      base.rendimientoBaseHumedadComercialKgHa = r.rendimientoBaseHumedadComercialKgHa ?? ''
      base.peso100S1   = r.peso100S1   ?? ''
      base.peso100S2   = r.peso100S2   ?? ''
      base.peso100S3   = r.peso100S3   ?? ''
      base.pmgS1       = r.pmgS1       ?? ''
      base.pmgS2       = r.pmgS2       ?? ''
      base.pmgS3       = r.pmgS3       ?? ''
      base.pmgPromedio = r.pmgPromedio  ?? ''
    }

    rows.push(COLS.map(c => csvEsc(base[c])).join(';'))
  })

  // BOM UTF-8 para que Excel abra correctamente caracteres especiales
  const csv  = '\uFEFF' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `captura-brassicaceas-${hoy()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// =========================
// ESTILOS
// =========================
// Paleta outdoor:
//   Fondo página:   #F5F5F3
//   Fondo card:     #FFFFFF
//   Texto primario: #1F1F1F
//   Texto secundario: #5A5A5A
//   Naranja acción: #F28C28
//   Verde OK:       #00A651
//   Borde:          #D9D9D9

const C = {
  naranja:     '#F28C28',
  naranjaOsc:  '#D4740F',
  naranjaLight:'#FFF3E6',
  naranjaFade: '#FCEBD6',
  verde:       '#00A651',
  verdeLight:  '#E6F6EE',
  paginaBg:    '#F5F5F3',
  cardBg:      '#FFFFFF',
  textoPrim:   '#1F1F1F',
  textoSec:    '#5A5A5A',
  textoTer:    '#9A9A9A',
  borde:       '#D9D9D9',
  bordeActivo: '#F28C28',
  sepBg:       '#EBEBEB',
  inputBg:     '#FFFFFF',
  disabledBg:  '#EDEDED',
  disabledTxt: '#ADADAD',
} as const

const s = {
  wrap: {
    minHeight: '100dvh',
    background: C.paginaBg,
    color: C.textoPrim,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    paddingBottom: '48px',
  } as React.CSSProperties,

  // Header limpio, naranja como acento superior
  header: {
    background: C.cardBg,
    borderBottom: `1px solid ${C.borde}`,
    borderTop: `3px solid ${C.naranja}`,
    padding: '13px 18px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  htitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: C.textoPrim,
    margin: 0,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  hsub: {
    fontSize: '12px',
    color: C.textoSec,
    margin: '2px 0 0',
    fontWeight: 500,
  } as React.CSSProperties,

  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxWidth: '480px',
    margin: '0 auto',
  },

  card: {
    background: C.cardBg,
    border: `1px solid ${C.borde}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },

  label: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: C.textoSec,
    marginBottom: '2px',
  } as React.CSSProperties,

  // Inputs táctiles: mínimo 56px de alto para uso con guantes
  select: {
    width: '100%',
    minHeight: '56px',
    padding: '0 14px',
    background: C.inputBg,
    border: `1.5px solid ${C.borde}`,
    borderRadius: '8px',
    color: C.textoPrim,
    fontSize: '16px',
    fontWeight: 500,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },

  selectSm: {
    flex: 1,
    minHeight: '52px',
    padding: '0 14px',
    background: C.inputBg,
    border: `1.5px solid ${C.borde}`,
    borderRadius: '8px',
    color: C.textoPrim,
    fontSize: '15px',
    fontWeight: 500,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    cursor: 'pointer',
    outline: 'none',
  },

  input: {
    width: '100%',
    minHeight: '56px',
    padding: '0 14px',
    background: C.inputBg,
    border: `1.5px solid ${C.borde}`,
    borderRadius: '8px',
    color: C.textoPrim,
    fontSize: '16px',
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },

  // Botón primario: naranja sólido, alto generoso
  btn: {
    width: '100%',
    minHeight: '56px',
    padding: '0 16px',
    background: C.naranja,
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  btnDisabled: {
    background: C.disabledBg,
    color: C.disabledTxt,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  // Botón secundario: borde naranja, texto naranja
  btnSecondary: {
    width: '100%',
    minHeight: '52px',
    padding: '0 16px',
    background: C.cardBg,
    border: `1.5px solid ${C.naranja}`,
    borderRadius: '10px',
    color: C.naranja,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,

  // Botón acción compacto (Aplicar)
  btnApply: {
    minHeight: '52px',
    padding: '0 18px',
    background: C.naranja,
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },

  // Chip de código (estadio fenológico, franja, fase)
  chip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    background: C.naranjaLight,
    color: C.naranjaOsc,
    border: `1px solid ${C.naranjaFade}`,
    fontWeight: 700,
    letterSpacing: '0.02em',
  } as React.CSSProperties,

  chipSm: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontFamily: 'monospace',
    background: C.naranjaLight,
    color: C.naranjaOsc,
    border: `1px solid ${C.naranjaFade}`,
    fontWeight: 700,
  } as React.CSSProperties,

  // Chip de estado activo/acción
  chipActive: {
    background: C.naranja,
    borderColor: C.naranja,
    color: '#FFFFFF',
  } as React.CSSProperties,

  // Chip de estado OK/confirmado
  chipOk: {
    background: C.verdeLight,
    borderColor: '#7DCE9F',
    color: '#007A3D',
    border: '1px solid #7DCE9F',
  } as React.CSSProperties,

  sep: {
    height: '1px',
    background: C.sepBg,
    margin: '4px 0',
  } as React.CSSProperties,

  // Badge de red (online/offline)
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: C.textoSec,
    background: C.paginaBg,
    border: `1px solid ${C.borde}`,
    borderRadius: '20px',
    padding: '5px 12px',
  } as React.CSSProperties,

  dot: (on: boolean): React.CSSProperties => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: on ? C.verde : '#E5402A',
    flexShrink: 0,
  }),

  // Barra de contexto: borde naranja izquierdo como acento técnico
  ctxBar: {
    background: C.cardBg,
    border: `1px solid ${C.borde}`,
    borderLeft: `4px solid ${C.naranja}`,
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px 24px',
  },
  ctxItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  ctxKey: {
    fontSize: '10px',
    color: C.textoTer,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    fontWeight: 700,
  } as React.CSSProperties,
  ctxVal: {
    color: C.textoPrim,
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
}

// =========================
// COMPONENTES PEQUEÑOS
// =========================

type ContextBarProps = {
  campania:    string
  ensayo:      string
  sitioNombre: string
  franja?:     string   // opcional — módulos sin franja no la pasan
  fecha:       string
  extra?:      [string, string][]
}

function ContextBar({ campania, ensayo, sitioNombre, franja, fecha, extra = [] }: ContextBarProps) {
  const items: [string, string][] = [
    ['Campaña', campania],
    ['Ensayo',  ensayo],
    ['Sitio',   sitioNombre],
    ...(franja ? [['Franja', franja] as [string, string]] : []),
    ['Fecha',   fmtFecha(fecha)],
    ...extra,
  ]
  return (
    <div style={s.ctxBar}>
      {items.map(([k, v]) => (
        <div key={k} style={s.ctxItem}>
          <span style={s.ctxKey}>{k}</span>
          <span style={s.ctxVal}>{v}</span>
        </div>
      ))}
    </div>
  )
}

// =========================
// APP PRINCIPAL
// =========================

export default function App() {

  // ── Conectividad ────────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // ── Navegación ──────────────────────────────────────────────────────────────
  const [pantalla, setPantalla] = useState<Pantalla>('contexto')

  // ── Contexto experimental ───────────────────────────────────────────────────
  const [campania, setCampania] = useState('')
  const [ensayo,   setEnsayo]   = useState('')
  const [sitioId,  setSitioId]  = useState('')
  const [fecha,    setFecha]    = useState(hoy())

  // ── Módulo: Fenología ───────────────────────────────────────────────────────
  const [selFen,         setSelFen]         = useState<Record<string, string>>({})
  const [globalEst,      setGlobalEst]      = useState('')
  const [ultimaBatchFen, setUltimaBatchFen] = useState<RegistroFenologia[]>([])

  // Observaciones sanitarias por material (opcional, no bloquea guardado)
  type ObsFenEntry = {
    franja:        string
    danoHelada:    string
    fitotoxicidad: string
    herbicidas:    string
    plagas:        string
    enfermedades:  string
  }
  const obsVacias = (): ObsFenEntry => ({
    franja: '', danoHelada: '', fitotoxicidad: '', herbicidas: '', plagas: '', enfermedades: '',
  })
  const [obsData,     setObsData]     = useState<Record<string, ObsFenEntry>>({})
  const [obsExpanded, setObsExpanded] = useState<Record<string, boolean>>({})

  // ── Módulo: Stand ────────────────────────────────────────────────────────────
  const [standFranja,      setStandFranja]      = useState('')
  const [nSubmuestras,    setNSubmuestras]    = useState(3)
  const [standData,       setStandData]       = useState<Record<string, StandEntry>>({})
  const [ultimaBatchStand,setUltimaBatchStand]= useState<RegistroStand[]>([])

  // ── Módulo: Lluvia ───────────────────────────────────────────────────────────
  const [lluviaMmInput,    setLluviaMmInput]    = useState('')
  const [lluviaObs,        setLluviaObs]        = useState('')
  const [fechaLluvia,      setFechaLluvia]      = useState('')
  const [ultimaLluvia,     setUltimaLluvia]     = useState<RegistroLluvia | null>(null)

  // ── Módulo: Cosecha ──────────────────────────────────────────────────────────
  const [cosechaFranja,    setCosechaFranja]    = useState('')
  const [cosechaMaterial,  setCosechaMaterial]  = useState('')
  const [cosechaFecha,     setCosechaFecha]     = useState('')
  const [cosechaLargo,     setCosechaLargo]     = useState('')
  const [cosechaSurcos,    setCosechaSurcos]    = useState('')
  const [cosechaDistanciaCm, setCosechaDistanciaCm] = useState('')   // cm ingresados por usuario
  const [cosechaPeso,      setCosechaPeso]      = useState('')
  const [cosechaHumedad,   setCosechaHumedad]   = useState('')
  const [cosechaPeso100_1, setCosechaPeso100_1] = useState('')  // g por 100 granos
  const [cosechaPeso100_2, setCosechaPeso100_2] = useState('')
  const [cosechaPeso100_3, setCosechaPeso100_3] = useState('')
  const [ultimaCosecha,    setUltimaCosecha]    = useState<RegistroCosecha | null>(null)

  // ── Acumulador de sesión ────────────────────────────────────────────────────
  // Persiste en localStorage. Lazy initializer: se ejecuta solo en el primer render.
  const [registrosSesion, setRegistrosSesion] = useState<RegistroSesion[]>(() => {
    try {
      const raw = localStorage.getItem('agri_registros')
      if (!raw) return []
      return JSON.parse(raw) as RegistroSesion[]
    } catch {
      return []
    }
  })

  // Guarda automáticamente en localStorage cada vez que cambia.
  useEffect(() => {
    try {
      localStorage.setItem('agri_registros', JSON.stringify(registrosSesion))
    } catch {
      // localStorage lleno o no disponible — silencioso
    }
  }, [registrosSesion])

  // ── Derivados ───────────────────────────────────────────────────────────────
  const SITIOS: Sitio[]        = SITIOS_DATA
  const sitioActivo            = SITIOS.find(si => si.id === sitioId) ?? null
  const tieneFranjas           = sitioActivo?.franjas !== null   // usado por Stand y Cosecha
  const ensayosDisp            = campania ? (ENSAYOS_POR_CAMPANIA[campania] ?? []) : []
  const materialesCtx          = sitioId  ? (MATERIALES_POR_SITIO[sitioId]  ?? []) : []
  const fenologiaCat: Estadio[] = FENOLOGIA_CAT

  const contextoCompleto =
    campania !== '' && ensayo !== '' && sitioId !== '' && fecha !== ''

  const todosSeleccionados =
    materialesCtx.length > 0 && materialesCtx.every(m => !!selFen[m])

  // Franja efectiva por módulo
  const standFranjaFinal  = tieneFranjas ? standFranja  : 'F1'
  const cosechaFranjaFinal = tieneFranjas ? cosechaFranja : 'F1'

  const fenRegistrosSesion    = registrosSesion.filter(r => r.modulo === 'fenologia').length
  const standRegistrosSesion  = registrosSesion.filter(r => r.modulo === 'stand').length
  const lluviaRegistrosSesion = registrosSesion.filter(r => r.modulo === 'lluvia').length

  // Lluvia: normalizar coma→punto y validar número >= 0
  const lluviaMmNorm   = lluviaMmInput.replace(',', '.')
  const lluviaMmValida = lluviaMmInput.trim() !== '' && !isNaN(Number(lluviaMmNorm)) && Number(lluviaMmNorm) >= 0

  // Cosecha: cálculos en vivo
  const cLargo         = parseNum(cosechaLargo)
  const cSurcos        = cosechaSurcos.trim() !== '' && /^\d+$/.test(cosechaSurcos.trim())
    ? parseInt(cosechaSurcos, 10) : null
  const cDistanciaCm   = parseNum(cosechaDistanciaCm)
  const cDistanciaM    = cDistanciaCm !== null ? cDistanciaCm / 100 : null   // cm → m
  const cAncho         = (cSurcos !== null && cSurcos > 0 && cDistanciaM !== null && cDistanciaM > 0)
    ? cSurcos * cDistanciaM : null
  const cPeso          = parseNum(cosechaPeso)
  const cHumedad       = parseNum(cosechaHumedad)
  // Peso 100 granos → PMG (× 10). PMG = peso de 1000 granos.
  const cPeso100_1  = parseNum(cosechaPeso100_1)
  const cPeso100_2  = parseNum(cosechaPeso100_2)
  const cPeso100_3  = parseNum(cosechaPeso100_3)
  const cPmg1       = cPeso100_1 !== null ? cPeso100_1 * 10 : null
  const cPmg2       = cPeso100_2 !== null ? cPeso100_2 * 10 : null
  const cPmg3       = cPeso100_3 !== null ? cPeso100_3 * 10 : null

  const cSuperficie  = (cLargo !== null && cAncho !== null) ? cLargo * cAncho : null
  const cRendHumedo  = (cSuperficie !== null && cSuperficie > 0 && cPeso !== null)
    ? (cPeso / cSuperficie) * 10000 : null

  const cHumedadComercial = cosechaMaterial ? humedadComercialPorMaterial(cosechaMaterial) : null
  const cRendCorregido    = (cRendHumedo !== null && cHumedad !== null && cHumedadComercial !== null)
    ? (cRendHumedo * ((100 - cHumedad) / 100)) * (1 / (1 - cHumedadComercial / 100)) : null

  const cPmgVals     = [cPmg1, cPmg2, cPmg3].filter((v): v is number => v !== null)
  const cPmgProm     = cPmgVals.length > 0 ? cPmgVals.reduce((a, b) => a + b, 0) / cPmgVals.length : null

  // Peso 100 granos: si se cargó, debe estar entre 0.1 y 2 g. Bloquea guardado.
  const peso100Invalido = [cPeso100_1, cPeso100_2, cPeso100_3].some(
    p => p !== null && (p < 0.1 || p > 2)
  )

  const cosechaCompleta =
    cosechaFranjaFinal !== '' && cosechaMaterial !== '' && cosechaFecha !== '' &&
    cLargo       !== null && cLargo       > 0 &&
    cSurcos      !== null && cSurcos      > 0 &&
    cDistanciaCm !== null && cDistanciaCm > 0 &&
    cPeso        !== null && cPeso        > 0   // > 0, no >= 0

  // Alertas agronómicas basadas en rendimiento calculado kg/ha
  const rendBajoWarn  = cRendHumedo !== null && cRendHumedo < 300
  const rendAltoWarn  = cRendHumedo !== null && cRendHumedo > 5000 && cRendHumedo <= 8000
  const rendBloqueo   = cRendHumedo !== null && cRendHumedo > 8000  // bloquea guardado

  // Unicidad: sitio + material + franja solo puede cosecharse una vez por sesión
  const cosechaDuplicada = registrosSesion.some(
    r => r.modulo === 'cosecha' &&
         r.sitioId  === sitioId &&
         (r as RegistroCosecha).material === cosechaMaterial &&
         (r as RegistroCosecha).franja   === cosechaFranjaFinal
  )

  const cosechaRegistrosSesion = registrosSesion.filter(r => r.modulo === 'cosecha').length

  // Stand: un material está completo si tiene nSubmuestras valores numéricos válidos (≥0)
  const standMaterialCompleto = (entry: { vals: string[] } | undefined) =>
    !!entry && entry.vals.length === nSubmuestras &&
    entry.vals.every(v => {
      const n = Number(v)
      return v.trim() !== '' && !isNaN(n) && n >= 0 && n <= 100
    })

  const standCompleto =
    standFranjaFinal !== '' &&
    materialesCtx.length > 0 && materialesCtx.every(m => standMaterialCompleto(standData[m]))

  // ── Handlers: contexto ──────────────────────────────────────────────────────
  const handleCampania = (c: string) => {
    setCampania(c); setEnsayo(''); setSitioId('')
  }
  const handleSitio = (id: string) => {
    setSitioId(id)
  }
  const handleReset = () => {
    setPantalla('contexto')
    setCampania(''); setEnsayo(''); setSitioId('')
    setFecha(hoy())
    // NO borrar registrosSesion — el histórico persiste entre visitas
  }

  const borrarDatosLocales = () => {
    const ok = window.confirm(
      'Esto eliminará los registros guardados localmente en este dispositivo. ¿Continuar?'
    )
    if (!ok) return
    setRegistrosSesion([])
    // localStorage se limpia via el useEffect de persistencia
  }

  // ── Handlers: fenología ─────────────────────────────────────────────────────
  const abrirFenologia = () => {
    setSelFen({}); setGlobalEst('')
    // Inicializar obs vacías por material
    const initObs: Record<string, ObsFenEntry> = {}
    materialesCtx.forEach(m => { initObs[m] = obsVacias() })
    setObsData(initObs)
    setObsExpanded({})
    setPantalla('fenologia')
  }

  const aplicarGlobal = () => {
    if (!globalEst) return
    const nuevo: Record<string, string> = {}
    materialesCtx.forEach(m => { nuevo[m] = globalEst })
    setSelFen(nuevo)
  }

  const guardarFenologia = () => {
    const ts = Date.now()
    const nuevos: RegistroFenologia[] = materialesCtx.map(mat => {
      const est = fenologiaCat.find(f => f.codigo === selFen[mat])!
      return {
        modulo:      'fenologia' as const,
        campania, ensayo, sitioId,
        sitioNombre: sitioActivo?.nombre ?? '',
        fecha,
        material:    mat,
        codigo:      est.codigo,
        label:       est.label,
      }
    })

    // Guardar observaciones opcionales — solo si algún campo tiene valor
    const obsNuevos: RegistroObservacionFenologia[] = []
    materialesCtx.forEach(mat => {
      const o = obsData[mat]
      if (!o) return
      const tieneAlgo = o.danoHelada || o.fitotoxicidad || o.herbicidas || o.plagas || o.enfermedades
      if (!tieneAlgo) return
      const franjaObs = tieneFranjas ? (o.franja || '') : 'F1'
      obsNuevos.push({
        modulo:             'observacion_fenologia' as const,
        campania, ensayo, sitioId,
        sitioNombre:        sitioActivo?.nombre ?? '',
        material:           mat,
        franja:             franjaObs,
        fecha,
        estadioFenologico:  selFen[mat] || undefined,
        danoHelada:         o.danoHelada    || undefined,
        fitotoxicidad:      o.fitotoxicidad || undefined,
        herbicidas:         o.herbicidas    || undefined,
        plagas:             o.plagas        || undefined,
        enfermedades:       o.enfermedades  || undefined,
        timestamp:          ts,
      })
    })

    setUltimaBatchFen(nuevos)
    setRegistrosSesion(prev => [...prev, ...nuevos, ...obsNuevos])
    setPantalla('fenologia-ok')
  }

  // ── Handlers: Stand ─────────────────────────────────────────────────────────
  const abrirStand = () => {
    setStandFranja('')
    const init: Record<string, { vals: string[]; obs: string }> = {}
    materialesCtx.forEach(m => { init[m] = { vals: Array(3).fill(''), obs: '' } })
    setNSubmuestras(3)
    setStandData(init)
    setPantalla('stand')
  }

  const cambiarNSubmuestras = (n: number) => {
    if (n < 1 || n > 10) return
    setNSubmuestras(n)
    setStandData(prev => {
      const next = { ...prev }
      materialesCtx.forEach(m => {
        const curr = prev[m]?.vals ?? []
        next[m] = {
          vals: n > curr.length
            ? [...curr, ...Array(n - curr.length).fill('')]
            : curr.slice(0, n),
          obs: prev[m]?.obs ?? '',
        }
      })
      return next
    })
  }

  const setStandVal = (mat: string, idx: number, val: string) => {
    // Solo aceptar dígitos y punto decimal
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return
    setStandData(prev => {
      const entry = prev[mat] ?? { vals: Array(nSubmuestras).fill(''), obs: '' }
      const vals = [...entry.vals]
      vals[idx] = val
      return { ...prev, [mat]: { ...entry, vals } }
    })
  }

  const setStandObs = (mat: string, obs: string) => {
    setStandData(prev => ({
      ...prev,
      [mat]: { ...(prev[mat] ?? { vals: Array(nSubmuestras).fill(''), obs: '' }), obs },
    }))
  }

  const guardarStand = () => {
    const timestamp = Date.now()
    const nuevos: RegistroStand[] = []
    materialesCtx.forEach(mat => {
      const entry = standData[mat]
      entry.vals.forEach((v, idx) => {
        nuevos.push({
          modulo:          'stand' as const,
          campania,
          ensayo,
          sitioId,
          sitioNombre:     sitioActivo?.nombre ?? '',
          franja:          standFranjaFinal,
          material:        mat,
          submuestra:      idx + 1,
          plantasLogradas: Number(v),
          observaciones:   entry.obs.trim() || undefined,
          fecha,
          timestamp,
        })
      })
    })
    setUltimaBatchStand(nuevos)
    setRegistrosSesion(prev => [...prev, ...nuevos])
    setPantalla('stand-ok')
  }

  // ── Handlers: Lluvia ────────────────────────────────────────────────────────
  const abrirLluvia = () => {
    setLluviaMmInput('')
    setLluviaObs('')
    setFechaLluvia(fecha)   // default = fecha de visita del contexto
    setPantalla('lluvia')
  }

  const guardarLluvia = () => {
    const nuevo: RegistroLluvia = {
      modulo:        'lluvia' as const,
      campania,
      ensayo,
      sitioId,
      sitioNombre:   sitioActivo?.nombre ?? '',
      fecha:         fechaLluvia,   // fecha real del evento, no la de visita
      lluviaMm:      Number(lluviaMmNorm),
      observaciones: lluviaObs.trim() || undefined,
      timestamp:     Date.now(),    // momento de carga — siempre now()
    }
    setUltimaLluvia(nuevo)
    setRegistrosSesion(prev => [...prev, nuevo])
    setPantalla('lluvia-ok')
  }

  // ── Handlers: Cosecha ───────────────────────────────────────────────────────
  const abrirCosecha = () => {
    setCosechaFranja('')
    setCosechaMaterial('')
    setCosechaFecha(fecha)
    setCosechaLargo(''); setCosechaSurcos(''); setCosechaDistanciaCm(''); setCosechaPeso('')
    setCosechaHumedad('')
    setCosechaPeso100_1(''); setCosechaPeso100_2(''); setCosechaPeso100_3('')
    setPantalla('cosecha')
  }

  const guardarCosecha = () => {
    const nuevo: RegistroCosecha = {
      modulo:              'cosecha' as const,
      campania, ensayo, sitioId,
      sitioNombre:         sitioActivo?.nombre ?? '',
      franja:              cosechaFranjaFinal,
      material:            cosechaMaterial,
      fechaCosecha:        cosechaFecha,
      largoFranjaM:                cLargo!,
      numeroSurcosCosechados:      cSurcos!,
      distanciaEntreSurcosCm:      cDistanciaCm!,
      distanciaEntreSurcosM:       cDistanciaM!,
      anchoFranjaM:                cAncho!,
      superficieM2:                cSuperficie!,
      pesoHumedoKg:                cPeso!,
      rendimientoHumedoKgHa:       cRendHumedo!,
      ...(cHumedad         !== null && { humedadMuestraPct: cHumedad }),
      ...(cHumedadComercial !== null && cHumedad !== null && { humedadComercializacionPct: cHumedadComercial }),
      ...(cRendCorregido   !== null && { rendimientoBaseHumedadComercialKgHa: cRendCorregido }),
      ...(cPmg1 !== null && { pmgS1: cPmg1 }),
      ...(cPmg2 !== null && { pmgS2: cPmg2 }),
      ...(cPmg3 !== null && { pmgS3: cPmg3 }),
      ...(cPmgProm !== null && { pmgPromedio: cPmgProm }),
      ...(cPeso100_1 !== null && { peso100S1: cPeso100_1 }),
      ...(cPeso100_2 !== null && { peso100S2: cPeso100_2 }),
      ...(cPeso100_3 !== null && { peso100S3: cPeso100_3 }),
      timestamp: Date.now(),
    }
    setUltimaCosecha(nuevo)
    setRegistrosSesion(prev => [...prev, nuevo])
    setPantalla('cosecha-ok')
  }

  // ── Render: contexto ────────────────────────────────────────────────────────
  if (pantalla === 'contexto') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Agri Captura</p>
          <p style={s.hsub}>Selección de contexto</p>
        </div>
        <span style={s.badge}>
          <span style={s.dot(isOnline)} />
          {isOnline ? 'en línea' : 'sin red'}
        </span>
      </div>

      <div style={s.body}>

        {/* Campaña */}
        <div style={s.card}>
          <label style={s.label}>Campaña</label>
          <select style={s.select} value={campania} onChange={e => handleCampania(e.target.value)}>
            <option value="">— seleccionar —</option>
            {CAMPANIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Ensayo */}
        <div style={{ ...s.card, opacity: campania ? 1 : 0.45 }}>
          <label style={s.label}>Ensayo</label>
          <select
            style={s.select} value={ensayo} disabled={!campania}
            onChange={e => { setEnsayo(e.target.value); setSitioId('') }}
          >
            <option value="">— seleccionar —</option>
            {ensayosDisp.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Sitio */}
        <div style={{ ...s.card, opacity: ensayo ? 1 : 0.45 }}>
          <label style={s.label}>Sitio</label>
          <select style={s.select} value={sitioId} disabled={!ensayo} onChange={e => handleSitio(e.target.value)}>
            <option value="">— seleccionar —</option>
            {SITIOS.map(si => <option key={si.id} value={si.id}>{si.nombre}</option>)}
          </select>
        </div>

        {/* Fecha */}
        <div style={s.card}>
          <label style={s.label}>Fecha de visita</label>
          <input type="date" style={s.input} value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>

        {/* Confirmar */}
        <button
          style={{ ...s.btn, ...(contextoCompleto ? {} : s.btnDisabled) }}
          disabled={!contextoCompleto}
          onClick={() => setPantalla('modulos')}
        >
          Confirmar contexto →
        </button>

        {/* Indicador de progreso de campos */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.borde, letterSpacing: '0.2em' }}>
          {[campania, ensayo, sitioActivo?.nombre, fecha]
            .map(v => v ? '●' : '○').join(' ')}
        </p>
      </div>
    </div>
  )

  // ── Render: módulos ─────────────────────────────────────────────────────────
  if (pantalla === 'modulos') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Agri Captura</p>
          <p style={s.hsub}>Módulos de captura</p>
        </div>
        <span style={s.badge}>
          <span style={s.dot(isOnline)} />
          {isOnline ? 'en línea' : 'sin red'}
        </span>
      </div>

      <div style={s.body}>

        <ContextBar
          campania={campania}
          ensayo={ensayo}
          sitioNombre={sitioActivo?.nombre ?? ''}
          fecha={fecha}
        />

        {/* Módulos disponibles */}
        <div style={s.card}>
          <label style={s.label}>Fase 1 — disponibles</label>
          <div style={s.sep} />

          {/* Fenología — activo */}
          <div
            onClick={abrirFenologia}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: `1px solid ${C.sepBg}`,
              cursor: 'pointer',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.textoPrim }}>
                Fenología
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textoSec, fontWeight: 500 }}>
                batch · {materialesCtx.length} materiales
                {fenRegistrosSesion > 0 && (
                  <span style={{ color: C.verde, marginLeft: '6px', fontWeight: 700 }}>
                    · {fenRegistrosSesion} registrados ✓
                  </span>
                )}
              </p>
            </div>
            <span style={{ ...s.chip, ...s.chipActive, fontSize: '14px', padding: '6px 12px' }}>▶</span>
          </div>

          {/* Stand de plantas — activo */}
          <div
            onClick={abrirStand}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: `1px solid ${C.sepBg}`,
              cursor: 'pointer',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.textoPrim }}>
                Stand de plantas
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textoSec, fontWeight: 500 }}>
                batch · submuestras por material
                {standRegistrosSesion > 0 && (
                  <span style={{ color: C.verde, marginLeft: '6px', fontWeight: 700 }}>
                    · {standRegistrosSesion} registrados ✓
                  </span>
                )}
              </p>
            </div>
            <span style={{ ...s.chip, ...s.chipActive, fontSize: '14px', padding: '6px 12px' }}>▶</span>
          </div>

          {/* Lluvias — activo */}
          <div
            onClick={abrirLluvia}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: `1px solid ${C.sepBg}`, cursor: 'pointer',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.textoPrim }}>Lluvias</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textoSec, fontWeight: 500 }}>
                nivel sitio · mm acumulados
                {lluviaRegistrosSesion > 0 && (
                  <span style={{ color: C.verde, marginLeft: '6px', fontWeight: 700 }}>
                    · {lluviaRegistrosSesion} registrado{lluviaRegistrosSesion > 1 ? 's' : ''} ✓
                  </span>
                )}
              </p>
            </div>
            <span style={{ ...s.chip, ...s.chipActive, fontSize: '14px', padding: '6px 12px' }}>▶</span>
          </div>

          {/* Cosecha — activo */}
          <div
            onClick={abrirCosecha}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', cursor: 'pointer',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.textoPrim }}>
                Cosecha / Postcosecha
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textoSec, fontWeight: 500 }}>
                rendimiento · humedad · PMG
                {cosechaRegistrosSesion > 0 && (
                  <span style={{ color: C.verde, marginLeft: '6px', fontWeight: 700 }}>
                    · {cosechaRegistrosSesion} registrado{cosechaRegistrosSesion > 1 ? 's' : ''} ✓
                  </span>
                )}
              </p>
            </div>
            <span style={{ ...s.chip, ...s.chipActive, fontSize: '14px', padding: '6px 12px' }}>▶</span>
          </div>
        </div>

        {/* Persistencia local + exportación */}
        <div style={{
          background: C.cardBg,
          border: `1px solid ${C.borde}`,
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {/* Indicador de registros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>💾</span>
            <span style={{ fontSize: '13px', color: C.textoSec, fontWeight: 500 }}>
              {registrosSesion.length === 0
                ? 'Sin registros guardados'
                : `${registrosSesion.length} registro${registrosSesion.length !== 1 ? 's' : ''} guardados localmente`
              }
            </span>
          </div>

          {/* Botón exportar — visible solo con datos */}
          <button
            onClick={() => exportarCSV(registrosSesion)}
            disabled={registrosSesion.length === 0}
            style={{
              width: '100%',
              padding: '11px',
              background: registrosSesion.length > 0 ? C.naranja : C.disabledBg,
              border: 'none',
              borderRadius: '8px',
              color: registrosSesion.length > 0 ? '#FFFFFF' : C.disabledTxt,
              fontSize: '14px',
              fontWeight: 700,
              cursor: registrosSesion.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>⬇</span>
            Exportar CSV
          </button>
        </div>

        <button style={s.btnSecondary} onClick={handleReset}>← Cambiar contexto</button>
      </div>
    </div>
  )

  // ── Render: fenología batch ─────────────────────────────────────────────────
  if (pantalla === 'fenologia') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Fenología batch</p>
          <p style={s.hsub}>{sitioActivo?.nombre} · {fmtFecha(fecha)}</p>
        </div>
        <button
          onClick={() => setPantalla('modulos')}
          style={{
            background: 'none',
            border: `1.5px solid ${C.borde}`,
            borderRadius: '8px',
            color: C.textoSec,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 12px',
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      <div style={s.body}>

        {/* Aplicar a todos */}
        <div style={{ ...s.card, gap: '8px' }}>
          <label style={s.label}>Aplicar estadio a todos</label>
          {/* flex-wrap: el botón baja a segunda línea si no hay ancho suficiente */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
            <select
              style={{ ...s.selectSm, flex: '1 1 180px', minWidth: 0 }}
              value={globalEst}
              onChange={e => setGlobalEst(e.target.value)}
            >
              <option value="">— estadio —</option>
              {fenologiaCat.map(f => (
                <option key={f.codigo} value={f.codigo}>{f.codigo} — {f.label}</option>
              ))}
            </select>
            <button
              style={{
                ...s.btnApply,
                flex: '0 0 auto',
                width: '100%',
                maxWidth: '100%',
                opacity: globalEst ? 1 : 0.35,
                cursor:  globalEst ? 'pointer' : 'default',
              }}
              disabled={!globalEst}
              onClick={aplicarGlobal}
            >
              Aplicar a todos
            </button>
          </div>
        </div>

        {/* Selector por material */}
        <div style={s.card}>
          <label style={s.label}>Materiales — {materialesCtx.length} registros</label>
          <div style={s.sep} />

          {materialesCtx.map((mat, i) => (
            <div key={mat} style={{
              paddingTop:    i === 0 ? '6px' : '12px',
              paddingBottom: '12px',
              borderBottom:  i < materialesCtx.length - 1 ? `1px solid ${C.sepBg}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: C.textoPrim,
                  letterSpacing: '0.01em',
                }}>
                  {mat}
                </span>
                {selFen[mat] && <span style={s.chipSm}>{selFen[mat]}</span>}
              </div>
              <select
                style={{
                  ...s.select,
                  fontSize: '15px',
                  borderColor: selFen[mat] ? C.verde : C.borde,
                  borderWidth: selFen[mat] ? '2px' : '1.5px',
                  color: C.textoPrim,
                }}
                value={selFen[mat] ?? ''}
                onChange={e => setSelFen(prev => ({ ...prev, [mat]: e.target.value }))}
              >
                <option value="">— seleccionar estadio —</option>
                {fenologiaCat.map(f => (
                  <option key={f.codigo} value={f.codigo}>{f.codigo} — {f.label}</option>
                ))}
              </select>

              {/* Toggle observaciones opcionales */}
              <button
                onClick={() => setObsExpanded(prev => ({ ...prev, [mat]: !prev[mat] }))}
                style={{
                  background: 'none', border: 'none', padding: '2px 0',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  color: obsExpanded[mat] ? C.naranja : C.textoTer,
                  textAlign: 'left' as const,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '14px' }}>{obsExpanded[mat] ? '▾' : '▸'}</span>
                Observaciones sanitarias
                {/* Indicador si hay algo cargado */}
                {(() => {
                  const o = obsData[mat]
                  const lleno = o && (o.danoHelada || o.fitotoxicidad || o.herbicidas || o.plagas || o.enfermedades)
                  return lleno ? <span style={{ color: C.verde }}>✓</span> : null
                })()}
              </button>

              {/* Panel de observaciones — visible cuando expandido */}
              {obsExpanded[mat] && (() => {
                const o = obsData[mat] ?? obsVacias()
                const setObs = (field: keyof ObsFenEntry, val: string) =>
                  setObsData(prev => ({ ...prev, [mat]: { ...(prev[mat] ?? obsVacias()), [field]: val } }))

                return (
                  <div style={{
                    background: C.paginaBg, border: `1px solid ${C.borde}`,
                    borderRadius: '8px', padding: '12px', display: 'flex',
                    flexDirection: 'column', gap: '8px',
                  }}>
                    {/* Franja para la observación (independiente del batch de fenología) */}
                    {tieneFranjas ? (
                      <div>
                        <label style={{ ...s.label, fontSize: '10px', display: 'block', marginBottom: '4px' }}>Franja</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {sitioActivo!.franjas!.map(f => (
                            <button key={f} onClick={() => setObs('franja', f)} style={{
                              flex: 1, minHeight: '40px', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '14px', fontWeight: 700, fontFamily: 'monospace',
                              border:      o.franja === f ? `2px solid ${C.naranja}` : `1px solid ${C.borde}`,
                              background:  o.franja === f ? C.naranja                : C.cardBg,
                              color:       o.franja === f ? '#FFFFFF'                : C.textoSec,
                            }}>{f}</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={s.chipSm}>F1</span>
                        <span style={{ fontSize: '12px', color: C.textoSec }}>franja única</span>
                      </div>
                    )}

                    {/* Campos de observación */}
                    {([
                      ['danoHelada',    'Daño por helada'],
                      ['fitotoxicidad', 'Fitotoxicidad'],
                      ['herbicidas',    'Herbicidas / aplicaciones observadas'],
                      ['plagas',        'Plagas'],
                      ['enfermedades',  'Enfermedades'],
                    ] as [keyof ObsFenEntry, string][]).map(([field, label]) => (
                      <div key={field}>
                        <label style={{ ...s.label, fontSize: '10px', display: 'block', marginBottom: '3px' }}>
                          {label}
                        </label>
                        <input
                          type="text"
                          placeholder="—"
                          value={o[field]}
                          onChange={e => setObs(field, e.target.value)}
                          style={{
                            ...s.input, minHeight: '44px', fontSize: '14px',
                            fontWeight: 400, color: C.textoPrim,
                            borderColor: o[field] ? C.verde : C.borde,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          ))}
        </div>

        {/* Progreso */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 600,
          color: C.textoSec,
          padding: '0 4px',
        }}>
          <span>{Object.values(selFen).filter(Boolean).length} / {materialesCtx.length} completados</span>
          {todosSeleccionados && (
            <span style={{ color: C.verde }}>✓ listo para guardar</span>
          )}
        </div>

        <button
          style={{ ...s.btn, ...(todosSeleccionados ? {} : s.btnDisabled) }}
          disabled={!todosSeleccionados}
          onClick={guardarFenologia}
        >
          Guardar fenología
        </button>

        <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
          ← Volver a módulos
        </button>
      </div>
    </div>
  )

  // ── Render: fenología guardada ──────────────────────────────────────────────
  if (pantalla === 'fenologia-ok') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Fenología guardada</p>
          <p style={s.hsub}>{sitioActivo?.nombre} · {fmtFecha(fecha)}</p>
        </div>
        {/* Check verde — único uso del verde como confirmación */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: C.verdeLight,
          color: C.verde,
          fontSize: '18px',
          fontWeight: 700,
        }}>✓</span>
      </div>

      <div style={s.body}>

        <ContextBar
          campania={campania}
          ensayo={ensayo}
          sitioNombre={sitioActivo?.nombre ?? ''}
          fecha={fecha}
          extra={[['Registros', String(ultimaBatchFen.length)]]}
        />

        {/* Tabla del batch guardado */}
        <div style={s.card}>
          <label style={s.label}>Registros cargados</label>
          <div style={s.sep} />
          {ultimaBatchFen.map((r, i) => (
            <div key={r.material} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: i < ultimaBatchFen.length - 1 ? `1px solid ${C.sepBg}` : 'none',
              gap: '12px',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: C.textoPrim,
                  letterSpacing: '0.01em',
                }}>
                  {r.material}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textoSec, fontWeight: 500 }}>
                  {r.label}
                </p>
              </div>
              <span style={s.chip}>{r.codigo}</span>
            </div>
          ))}
        </div>

        {registrosSesion.length > ultimaBatchFen.length && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: C.textoTer, fontWeight: 600 }}>
            {registrosSesion.length} registros guardados localmente
          </p>
        )}

        <button style={s.btn} onClick={abrirFenologia}>
          Nueva carga de fenología
        </button>

        <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
          ← Volver a módulos
        </button>

        <button style={s.btnSecondary} onClick={handleReset}>
          ← Cambiar contexto
        </button>
      </div>
    </div>
  )

  // ── Render: Stand batch ─────────────────────────────────────────────────────
  if (pantalla === 'stand') {
    const completados = materialesCtx.filter(m => standMaterialCompleto(standData[m])).length

    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <p style={s.htitle}>Stand de plantas</p>
            <p style={s.hsub}>{sitioActivo?.nombre} · {standFranjaFinal || '…'} · {fmtFecha(fecha)}</p>
          </div>
          <button
            onClick={() => setPantalla('modulos')}
            style={{
              background: 'none',
              border: `1.5px solid ${C.borde}`,
              borderRadius: '8px',
              color: C.textoSec,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            ✕ Cerrar
          </button>
        </div>

        <div style={s.body}>

          <ContextBar
            campania={campania}
            ensayo={ensayo}
            sitioNombre={sitioActivo?.nombre ?? ''}
            franja={standFranjaFinal || undefined}
            fecha={fecha}
          />

          {/* Selector de franja — solo si el sitio tiene más de una */}
          {tieneFranjas && (
            <div style={s.card}>
              <label style={s.label}>Franja</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {sitioActivo!.franjas!.map(f => (
                  <button key={f} onClick={() => setStandFranja(f)} style={{
                    flex: 1, minHeight: '52px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '18px', fontWeight: 700, fontFamily: 'monospace',
                    border:      standFranja === f ? `2px solid ${C.naranja}` : `1.5px solid ${C.borde}`,
                    background:  standFranja === f ? C.naranja                : C.cardBg,
                    color:       standFranja === f ? '#FFFFFF'                : C.textoSec,
                  }}>{f}</button>
                ))}
              </div>
            </div>
          )}
          {!tieneFranjas && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
              <span style={s.chip}>F1</span>
              <span style={{ fontSize: '13px', color: C.textoSec, fontWeight: 500 }}>franja única</span>
            </div>
          )}

          {/* Stepper de submuestras */}
          <div style={s.card}>
            <label style={s.label}>Submuestras por material</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '4px' }}>
              <button
                onClick={() => cambiarNSubmuestras(nSubmuestras - 1)}
                disabled={nSubmuestras <= 1}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: `2px solid ${nSubmuestras > 1 ? C.naranja : C.borde}`,
                  background: nSubmuestras > 1 ? C.naranja : C.paginaBg,
                  color: nSubmuestras > 1 ? '#FFFFFF' : C.textoTer,
                  fontSize: '22px', fontWeight: 700, cursor: nSubmuestras > 1 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >−</button>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: C.textoPrim, fontFamily: 'monospace' }}>
                  {nSubmuestras}
                </span>
                <p style={{ margin: '0', fontSize: '11px', color: C.textoTer, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  submuestras
                </p>
              </div>

              <button
                onClick={() => cambiarNSubmuestras(nSubmuestras + 1)}
                disabled={nSubmuestras >= 10}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: `2px solid ${nSubmuestras < 10 ? C.naranja : C.borde}`,
                  background: nSubmuestras < 10 ? C.naranja : C.paginaBg,
                  color: nSubmuestras < 10 ? '#FFFFFF' : C.textoTer,
                  fontSize: '22px', fontWeight: 700, cursor: nSubmuestras < 10 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >+</button>
            </div>
          </div>

          {/* Un bloque por material */}
          {materialesCtx.map(mat => {
            const entry  = standData[mat] ?? { vals: Array(nSubmuestras).fill(''), obs: '' }
            const prom   = promedio(entry.vals)
            const listo  = standMaterialCompleto(entry)

            return (
              <div key={mat} style={{
                ...s.card,
                borderColor: listo ? C.verde : C.borde,
                borderWidth: listo ? '2px' : '1px',
              }}>
                {/* Cabecera material */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '14px', fontWeight: 700, fontFamily: 'monospace',
                    color: C.textoPrim, letterSpacing: '0.01em',
                  }}>
                    {mat}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {prom !== '—' && (
                      <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 600 }}>
                        x̄ = <strong style={{ color: C.textoPrim }}>{prom}</strong>
                      </span>
                    )}
                    {listo && (
                      <span style={{ ...s.chipSm, ...s.chipOk }}>✓</span>
                    )}
                  </div>
                </div>

                <div style={s.sep} />

                {/* Grid de inputs por submuestra */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(nSubmuestras, 4)}, 1fr)`,
                  gap: '8px',
                }}>
                  {entry.vals.map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ ...s.label, fontSize: '10px', textAlign: 'center' }}>
                        M{idx + 1}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="100"
                        placeholder="—"
                        value={v}
                        onChange={e => setStandVal(mat, idx, e.target.value)}
                        style={{
                          ...s.input,
                          minHeight: '56px',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          padding: '0 8px',
                          borderColor: v !== '' && Number(v) > 100 ? '#EF4444'
                            : v !== '' && !isNaN(Number(v)) ? C.verde : C.borde,
                          borderWidth: v !== '' ? '2px' : '1.5px',
                          color: v !== '' && Number(v) > 100 ? '#EF4444' : C.textoPrim,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Error si algún recuento supera 100 */}
                {entry.vals.some(v => v !== '' && Number(v) > 100) && (
                  <p style={{
                    margin: 0, fontSize: '12px', fontWeight: 700,
                    color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    ⚠ El recuento no puede superar 100 plantas/m.
                  </p>
                )}

                {/* Observación opcional */}
                <input
                  type="text"
                  placeholder="Observación (opcional)"
                  value={entry.obs}
                  onChange={e => setStandObs(mat, e.target.value)}
                  style={{
                    ...s.input,
                    minHeight: '44px',
                    fontSize: '14px',
                    color: C.textoSec,
                    marginTop: '4px',
                  }}
                />
              </div>
            )
          })}

          {/* Progreso */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', fontWeight: 600, color: C.textoSec, padding: '0 4px',
          }}>
            <span>{completados} / {materialesCtx.length} materiales completos</span>
            {standCompleto && <span style={{ color: C.verde }}>✓ listo para guardar</span>}
          </div>

          <button
            style={{ ...s.btn, ...(standCompleto ? {} : s.btnDisabled) }}
            disabled={!standCompleto}
            onClick={guardarStand}
          >
            Guardar stand
          </button>

          <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
            ← Volver a módulos
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Stand guardado ──────────────────────────────────────────────────
  if (pantalla === 'stand-ok') {
    // Agrupar registros del último batch por material para el resumen
    const porMaterial = materialesCtx.map(mat => {
      const regs  = ultimaBatchStand.filter(r => r.material === mat)
      const vals  = regs.map(r => String(r.plantasLogradas))
      const prom  = promedio(vals)
      const obs   = regs[0]?.observaciones ?? ''
      return { mat, regs, vals, prom, obs }
    })

    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <p style={s.htitle}>Stand guardado</p>
            <p style={s.hsub}>{sitioActivo?.nombre} · {standFranjaFinal} · {fmtFecha(fecha)}</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '50%',
            background: C.verdeLight, color: C.verde, fontSize: '18px', fontWeight: 700,
          }}>✓</span>
        </div>

        <div style={s.body}>

          <ContextBar
            campania={campania}
            ensayo={ensayo}
            sitioNombre={sitioActivo?.nombre ?? ''}
            franja={standFranjaFinal || undefined}
            fecha={fecha}
            extra={[
              ['Materiales', String(materialesCtx.length)],
              ['Submuestras', String(nSubmuestras)],
              ['Registros',  String(ultimaBatchStand.length)],
            ]}
          />

          {/* Tabla resumen por material */}
          <div style={s.card}>
            <label style={s.label}>Resumen por material</label>
            <div style={s.sep} />
            {porMaterial.map(({ mat, vals, prom, obs }, i) => (
              <div key={mat} style={{
                padding: '12px 0',
                borderBottom: i < porMaterial.length - 1 ? `1px solid ${C.sepBg}` : 'none',
              }}>
                {/* Nombre + promedio */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                    {mat}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: C.naranja, fontFamily: 'monospace' }}>
                    x̄ {prom}
                  </span>
                </div>
                {/* Chips de submuestras */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {vals.map((v, idx) => (
                    <span key={idx} style={{
                      ...s.chipSm,
                      background: C.paginaBg,
                      color: C.textoPrim,
                      border: `1px solid ${C.borde}`,
                      padding: '3px 10px',
                      fontSize: '13px',
                    }}>
                      M{idx + 1}: {v}
                    </span>
                  ))}
                </div>
                {obs && (
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.textoSec, fontStyle: 'italic' }}>
                    {obs}
                  </p>
                )}
              </div>
            ))}
          </div>

          {registrosSesion.length > ultimaBatchStand.length && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: C.textoTer, fontWeight: 600 }}>
              {registrosSesion.length} registros guardados localmente
            </p>
          )}

          <button style={s.btn} onClick={abrirStand}>
            Nueva carga de stand
          </button>

          <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
            ← Volver a módulos
          </button>

          <button style={s.btnSecondary} onClick={handleReset}>
            ← Cambiar contexto
          </button>
        </div>
      </div>
    )
  }

  // ── Render: lluvia ───────────────────────────────────────────────────────────
  if (pantalla === 'lluvia') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Registro de lluvia</p>
          <p style={s.hsub}>{sitioActivo?.nombre} · {fmtFecha(fecha)}</p>
        </div>
        <button
          onClick={() => setPantalla('modulos')}
          style={{
            background: 'none', border: `1.5px solid ${C.borde}`, borderRadius: '8px',
            color: C.textoSec, fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '6px 12px',
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      <div style={s.body}>

        <ContextBar
          campania={campania}
          ensayo={ensayo}
          sitioNombre={sitioActivo?.nombre ?? ''}
          fecha={fecha}
        />

        {/* Nota: lluvia es a nivel sitio */}
        <p style={{
          margin: 0, fontSize: '12px', color: C.textoSec, fontWeight: 500,
          background: C.paginaBg, border: `1px solid ${C.borde}`,
          borderRadius: '8px', padding: '10px 14px',
        }}>
          Registro a nivel sitio — no depende de franja ni material.
        </p>

        {/* Fecha del evento — editable, puede diferir de la fecha de visita */}
        <div style={s.card}>
          <label style={s.label}>
            Fecha de lluvia
            {fechaLluvia !== fecha && (
              <span style={{
                marginLeft: '8px', fontSize: '10px', fontWeight: 700,
                color: C.naranja, letterSpacing: '0.04em',
              }}>
                ≠ FECHA DE VISITA
              </span>
            )}
          </label>
          <input
            type="date"
            value={fechaLluvia}
            onChange={e => setFechaLluvia(e.target.value)}
            style={s.input}
          />
          {fechaLluvia !== fecha && (
            <button
              onClick={() => setFechaLluvia(fecha)}
              style={{
                background: 'none', border: 'none', padding: '0',
                fontSize: '12px', color: C.textoSec, cursor: 'pointer',
                textAlign: 'left' as const, textDecoration: 'underline',
              }}
            >
              Restablecer a fecha de visita ({fmtFecha(fecha)})
            </button>
          )}
        </div>

        {/* Input de mm — protagonista */}
        <div style={s.card}>
          <label style={s.label}>Precipitación</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={lluviaMmInput}
              onChange={e => {
                const v = e.target.value
                // Permitir dígitos, punto y coma — solo un separador decimal
                if (/^[\d]*[.,]?[\d]*$/.test(v)) setLluviaMmInput(v)
              }}
              style={{
                ...s.input,
                minHeight: '72px',
                fontSize: '36px',
                fontWeight: 700,
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: '64px',
                borderColor: lluviaMmValida ? C.verde : C.borde,
                borderWidth: lluviaMmInput ? '2px' : '1.5px',
                color: C.textoPrim,
              }}
            />
            {/* Unidad fija — el usuario nunca la escribe */}
            <span style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '20px', fontWeight: 700, color: C.textoTer, fontFamily: 'monospace',
              pointerEvents: 'none',
            }}>
              mm
            </span>
          </div>
          {lluviaMmInput && !lluviaMmValida && (
            <p style={{ margin: 0, fontSize: '12px', color: '#E5402A', fontWeight: 600 }}>
              Ingresá un número mayor o igual a 0
            </p>
          )}
        </div>

        {/* Observaciones */}
        <div style={s.card}>
          <label style={s.label}>Observaciones <span style={{ color: C.textoTer, fontWeight: 400 }}>(opcional)</span></label>
          <textarea
            placeholder="Ej: lluvia intensa con granizo, duración aprox. 20 min..."
            value={lluviaObs}
            onChange={e => setLluviaObs(e.target.value)}
            rows={3}
            style={{
              ...s.input,
              minHeight: '80px',
              fontSize: '15px',
              fontWeight: 400,
              padding: '12px 14px',
              resize: 'vertical' as const,
              fontFamily: 'inherit',
              color: C.textoSec,
            }}
          />
        </div>

        <button
          style={{ ...s.btn, ...(lluviaMmValida ? {} : s.btnDisabled) }}
          disabled={!lluviaMmValida}
          onClick={guardarLluvia}
        >
          Guardar lluvia
        </button>

        <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
          ← Volver a módulos
        </button>
      </div>
    </div>
  )

  // ── Render: lluvia guardada ──────────────────────────────────────────────────
  if (pantalla === 'lluvia-ok') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Lluvia guardada</p>
          <p style={s.hsub}>{sitioActivo?.nombre} · {fmtFecha(fecha)}</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '50%',
          background: C.verdeLight, color: C.verde, fontSize: '18px', fontWeight: 700,
        }}>✓</span>
      </div>

      <div style={s.body}>

        <ContextBar
          campania={campania}
          ensayo={ensayo}
          sitioNombre={sitioActivo?.nombre ?? ''}
          fecha={fecha}
        />

        {/* Resumen del registro */}
        {ultimaLluvia && (
          <div style={s.card}>
            <label style={s.label}>Registro guardado</label>
            <div style={s.sep} />

            {/* Valor protagonista */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: `1px solid ${C.sepBg}`,
            }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: C.textoPrim }}>Precipitación</span>
              <span style={{
                fontSize: '28px', fontWeight: 700, fontFamily: 'monospace', color: C.naranja,
              }}>
                {ultimaLluvia.lluviaMm} <span style={{ fontSize: '16px', color: C.textoSec }}>mm</span>
              </span>
            </div>

            {/* Fecha del evento */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: ultimaLluvia.observaciones ? `1px solid ${C.sepBg}` : 'none',
            }}>
              <span style={{ fontSize: '13px', color: C.textoSec }}>Fecha del evento</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: C.textoPrim }}>{fmtFecha(ultimaLluvia.fecha)}</span>
            </div>

            {/* Observaciones si existen */}
            {ultimaLluvia.observaciones && (
              <div style={{ padding: '10px 0' }}>
                <p style={{ margin: 0, fontSize: '11px', color: C.textoTer, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Observaciones
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: C.textoSec, fontStyle: 'italic' }}>
                  {ultimaLluvia.observaciones}
                </p>
              </div>
            )}
          </div>
        )}

        {registrosSesion.length > 1 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: C.textoTer, fontWeight: 600 }}>
            {registrosSesion.length} registros guardados localmente
          </p>
        )}

        <button style={s.btn} onClick={abrirLluvia}>
          Registrar otra lluvia
        </button>

        <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
          ← Volver a módulos
        </button>

        <button style={s.btnSecondary} onClick={handleReset}>
          ← Cambiar contexto
        </button>
      </div>
    </div>
  )

  // ── Render: cosecha ─────────────────────────────────────────────────────────
  if (pantalla === 'cosecha') {
    // Helper visual para inputs numéricos del módulo
    const numInput = (
      val: string,
      setter: (v: string) => void,
      placeholder: string,
      unit: string,
      parsed: number | null,
    ) => (
      <div style={{ position: 'relative' }}>
        <input
          type="text" inputMode="decimal" placeholder={placeholder} value={val}
          onChange={e => { if (/^[\d]*[.,]?[\d]*$/.test(e.target.value) || e.target.value === '') setter(e.target.value) }}
          style={{
            ...s.input, fontSize: '18px', fontWeight: 600, fontFamily: 'monospace',
            textAlign: 'right', paddingRight: unit.length > 3 ? '80px' : '60px',
            borderColor: val && parsed !== null ? C.verde : C.borde,
            borderWidth: val ? '2px' : '1.5px', color: C.textoPrim,
          }}
        />
        <span style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '13px', fontWeight: 700, color: C.textoTer, fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>{unit}</span>
      </div>
    )

    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <p style={s.htitle}>Cosecha / Postcosecha</p>
            <p style={s.hsub}>{sitioActivo?.nombre} · {cosechaFranjaFinal || '…'} · {fmtFecha(fecha)}</p>
          </div>
          <button onClick={() => setPantalla('modulos')} style={{
            background: 'none', border: `1.5px solid ${C.borde}`, borderRadius: '8px',
            color: C.textoSec, fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '6px 12px',
          }}>✕ Cerrar</button>
        </div>

        <div style={s.body}>
          <ContextBar campania={campania} ensayo={ensayo}
            sitioNombre={sitioActivo?.nombre ?? ''}
            franja={cosechaFranjaFinal || undefined}
            fecha={fecha} />

          {/* ── Configuración ── */}
          <div style={s.card}>
            <label style={s.label}>Configuración</label>
            <div style={s.sep} />

            {/* Franja */}
            {tieneFranjas ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ ...s.label, textTransform: 'none' as const, fontSize: '12px' }}>Franja</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {sitioActivo!.franjas!.map(f => (
                    <button key={f} onClick={() => setCosechaFranja(f)} style={{
                      flex: 1, minHeight: '52px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '18px', fontWeight: 700, fontFamily: 'monospace',
                      border:      cosechaFranja === f ? `2px solid ${C.naranja}` : `1.5px solid ${C.borde}`,
                      background:  cosechaFranja === f ? C.naranja                : C.cardBg,
                      color:       cosechaFranja === f ? '#FFFFFF'                : C.textoSec,
                    }}>{f}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={s.chip}>F1</span>
                <span style={{ fontSize: '13px', color: C.textoSec, fontWeight: 500 }}>franja única</span>
              </div>
            )}

            {/* Material */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ ...s.label, textTransform: 'none', fontSize: '12px' }}>Material</span>
              <select style={s.select} value={cosechaMaterial} onChange={e => setCosechaMaterial(e.target.value)}>
                <option value="">— seleccionar —</option>
                {materialesCtx.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Fecha cosecha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <span style={{ ...s.label, textTransform: 'none', fontSize: '12px' }}>
                Fecha de cosecha
                {cosechaFecha !== fecha && (
                  <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: C.naranja }}>
                    ≠ FECHA DE VISITA
                  </span>
                )}
              </span>
              <input type="date" value={cosechaFecha} onChange={e => setCosechaFecha(e.target.value)} style={s.input} />
              {cosechaFecha !== fecha && (
                <button onClick={() => setCosechaFecha(fecha)} style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: '12px', color: C.textoSec, cursor: 'pointer', textAlign: 'left' as const, textDecoration: 'underline',
                }}>Restablecer a fecha de visita ({fmtFecha(fecha)})</button>
              )}
            </div>
          </div>

          {/* ── Datos de cosecha ── */}
          <div style={s.card}>
            <label style={s.label}>Datos de cosecha</label>
            <div style={s.sep} />

            {/* Largo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ ...s.label, fontSize: '11px' }}>Largo de franja</span>
              {numInput(cosechaLargo, setCosechaLargo, '0', 'm', cLargo)}
            </div>

            {/* Surcos y distancia — ancho calculado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ ...s.label, fontSize: '11px' }}>Surcos cosechados</span>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" inputMode="numeric" placeholder="0"
                    value={cosechaSurcos}
                    onChange={e => { if (/^\d*$/.test(e.target.value)) setCosechaSurcos(e.target.value) }}
                    style={{
                      ...s.input, fontSize: '18px', fontWeight: 600, fontFamily: 'monospace',
                      textAlign: 'center',
                      borderColor: cSurcos !== null ? C.verde : C.borde,
                      borderWidth: cosechaSurcos ? '2px' : '1.5px', color: C.textoPrim,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ ...s.label, fontSize: '11px' }}>Dist. entre surcos</span>
                {numInput(cosechaDistanciaCm, setCosechaDistanciaCm, '0', 'cm', cDistanciaCm)}
              </div>
            </div>

            {/* Ancho calculado */}
            {cAncho !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.paginaBg, borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 600 }}>
                  Ancho calculado
                  <span style={{ fontWeight: 400, marginLeft: '6px' }}>
                    ({cosechaSurcos} surcos × {cDistanciaM?.toFixed(2)} m)
                  </span>
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                  {cAncho.toFixed(2)} <span style={{ fontSize: '12px', color: C.textoSec }}>m</span>
                </span>
              </div>
            )}

            {/* Superficie calculada */}
            {cSuperficie !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.paginaBg, borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 600 }}>Superficie</span>
                <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                  {cSuperficie.toFixed(2)} <span style={{ fontSize: '12px', color: C.textoSec }}>m²</span>
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <span style={{ ...s.label, fontSize: '11px' }}>Peso húmedo</span>
              {numInput(cosechaPeso, setCosechaPeso, '0', 'kg', cPeso)}
            </div>

            {/* Rendimiento húmedo calculado */}
            {cRendHumedo !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.naranjaLight, border: `1px solid ${C.naranjaFade}`,
                borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.naranjaOsc, fontWeight: 700 }}>Rend. húmedo</span>
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: C.naranja }}>
                  {Math.round(cRendHumedo).toLocaleString('es-AR')} <span style={{ fontSize: '12px' }}>kg/ha</span>
                </span>
              </div>
            )}
          </div>

          {/* ── Postcosecha (opcional) ── */}
          <div style={s.card}>
            <label style={s.label}>
              Postcosecha
              <span style={{ marginLeft: '8px', fontSize: '10px', color: C.textoTer, fontWeight: 400, textTransform: 'none' }}>
                opcional
              </span>
            </label>
            <div style={s.sep} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ ...s.label, fontSize: '11px' }}>Humedad de muestra</span>
              {numInput(cosechaHumedad, setCosechaHumedad, '—', '%', cHumedad)}
            </div>

            {/* Humedad de comercialización automática */}
            {cosechaMaterial && cHumedadComercial !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.paginaBg, borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 600 }}>
                  Humedad comerc.
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                  {cHumedadComercial} <span style={{ fontSize: '12px', color: C.textoSec }}>%</span>
                  <span style={{ fontSize: '11px', color: C.textoTer, marginLeft: '6px', fontFamily: 'inherit' }}>
                    (automático)
                  </span>
                </span>
              </div>
            )}

            {/* Rendimiento corregido */}
            {cRendCorregido !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.naranjaLight, border: `1px solid ${C.naranjaFade}`,
                borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.naranjaOsc, fontWeight: 700 }}>Rend. base hum. comerc.</span>
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: C.naranja }}>
                  {Math.round(cRendCorregido).toLocaleString('es-AR')} <span style={{ fontSize: '12px' }}>kg/ha</span>
                </span>
              </div>
            )}
          </div>

          {/* ── PMG — determinación por peso de 100 granos ── */}
          <div style={s.card}>
            <label style={s.label}>
              PMG
              <span style={{ marginLeft: '8px', fontSize: '10px', color: C.textoTer, fontWeight: 400, textTransform: 'none' }}>
                opcional · pesar 3 muestras de 100 granos
              </span>
            </label>
            <div style={s.sep} />

            {/* Inputs: peso de 100 granos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {([
                ['S1', cosechaPeso100_1, setCosechaPeso100_1, cPeso100_1],
                ['S2', cosechaPeso100_2, setCosechaPeso100_2, cPeso100_2],
                ['S3', cosechaPeso100_3, setCosechaPeso100_3, cPeso100_3],
              ] as [string, string, (v: string) => void, number | null][]).map(([lbl, v, set, p]) => {
                const fuera = p !== null && (p < 0.1 || p > 2)
                return (
                  <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ ...s.label, fontSize: '10px' }}>100 granos {lbl}</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text" inputMode="decimal" placeholder="—" value={v}
                        onChange={e => { if (/^[\d]*[.,]?[\d]*$/.test(e.target.value) || e.target.value === '') set(e.target.value) }}
                        style={{
                          ...s.input, fontSize: '18px', fontWeight: 600, fontFamily: 'monospace',
                          textAlign: 'right', paddingRight: '28px',
                          borderColor: fuera ? '#EF4444' : p !== null ? C.verde : C.borde,
                          borderWidth: v ? '2px' : '1.5px',
                          color: fuera ? '#EF4444' : C.textoPrim,
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '11px', fontWeight: 700, color: fuera ? '#EF4444' : C.textoTer,
                        fontFamily: 'monospace', pointerEvents: 'none',
                      }}>g</span>
                    </div>
                    {/* PMG calculado — solo si el valor es válido */}
                    {p !== null && !fuera && (
                      <span style={{
                        textAlign: 'center', fontSize: '11px', fontFamily: 'monospace',
                        fontWeight: 700, color: C.naranja,
                      }}>
                        PMG {(p * 10).toFixed(1)} g
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mensaje de error si algún peso está fuera de rango */}
            {peso100Invalido && (
              <p style={{
                margin: 0, fontSize: '12px', fontWeight: 700, color: '#EF4444',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                ⚠ El peso de 100 granos debe estar entre 0,1 y 2 g.
              </p>
            )}

            {/* PMG promedio final */}
            {cPmgProm !== null && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.paginaBg, borderRadius: '8px', padding: '10px 14px', marginTop: '4px',
              }}>
                <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 600 }}>PMG promedio</span>
                <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                  {cPmgProm.toFixed(1)} <span style={{ fontSize: '12px', color: C.textoSec }}>g</span>
                </span>
              </div>
            )}
          </div>

          {/* Aviso: rendimiento fuera de rango — warning, no bloquea */}
          {(rendBajoWarn || rendAltoWarn) && (
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #F59E0B',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                  Rendimiento fuera del rango esperado
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#78350F', lineHeight: 1.4 }}>
                  {rendBajoWarn
                    ? `${Math.round(cRendHumedo!).toLocaleString('es-AR')} kg/ha es menor a 300 kg/ha.`
                    : `${Math.round(cRendHumedo!).toLocaleString('es-AR')} kg/ha supera los 5.000 kg/ha.`
                  }{' '}
                  Revisar peso, largo, surcos o distancia entre surcos.
                </p>
              </div>
            </div>
          )}

          {/* Aviso: rendimiento extremo — bloquea guardado */}
          {rendBloqueo && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #EF4444',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🚫</span>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                  Rendimiento extremadamente alto
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#7F1D1D', lineHeight: 1.4 }}>
                  {Math.round(cRendHumedo!).toLocaleString('es-AR')} kg/ha supera los 8.000 kg/ha.
                  Revisar datos antes de guardar.
                </p>
              </div>
            </div>
          )}

          {/* Aviso de duplicado */}
          {cosechaDuplicada && (
            <div style={{
              background: '#FFF3E6',
              border: `1.5px solid ${C.naranja}`,
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.naranjaOsc }}>
                  Registro duplicado
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: C.textoSec, lineHeight: 1.4 }}>
                  Ya existe un registro de cosecha para{' '}
                  <strong>{sitioActivo?.nombre}</strong> · <strong>{cosechaMaterial}</strong> · <strong>{cosechaFranjaFinal}</strong>.
                  Cambiá el material o la franja para registrar otra cosecha.
                </p>
              </div>
            </div>
          )}

          <button
            style={{ ...s.btn, ...(!cosechaCompleta || cosechaDuplicada || rendBloqueo || peso100Invalido ? s.btnDisabled : {}) }}
            disabled={!cosechaCompleta || cosechaDuplicada || rendBloqueo || peso100Invalido}
            onClick={guardarCosecha}
          >
            Guardar cosecha
          </button>

          <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
            ← Volver a módulos
          </button>
        </div>
      </div>
    )
  }

  // ── Render: cosecha guardada ─────────────────────────────────────────────────
  if (pantalla === 'cosecha-ok') return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <p style={s.htitle}>Cosecha guardada</p>
          <p style={s.hsub}>{ultimaCosecha?.material} · {sitioActivo?.nombre} · {cosechaFranjaFinal}</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '50%',
          background: C.verdeLight, color: C.verde, fontSize: '18px', fontWeight: 700,
        }}>✓</span>
      </div>

      <div style={s.body}>
        <ContextBar campania={campania} ensayo={ensayo}
          sitioNombre={sitioActivo?.nombre ?? ''}
          franja={cosechaFranjaFinal || undefined}
          fecha={fecha} />

        {ultimaCosecha && (
          <div style={s.card}>
            <label style={s.label}>Resumen de cosecha</label>
            <div style={s.sep} />

            {/* Material y fecha */}
            {([
              ['Material',           ultimaCosecha.material],
              ['Fecha cosecha',      fmtFecha(ultimaCosecha.fechaCosecha)],
              ['Largo',              `${ultimaCosecha.largoFranjaM} m`],
              ['Surcos cosechados',  `${ultimaCosecha.numeroSurcosCosechados}`],
              ['Dist. entre surcos',  `${ultimaCosecha.distanciaEntreSurcosCm} cm`],
              ['Ancho calculado',     `${ultimaCosecha.anchoFranjaM.toFixed(2)} m`],
              ['Ancho calculado',    `${ultimaCosecha.anchoFranjaM.toFixed(2)} m`],
              ['Superficie',         `${ultimaCosecha.superficieM2.toFixed(2)} m²`],
              ['Peso húmedo',        `${ultimaCosecha.pesoHumedoKg} kg`],
            ] as [string, string][]).map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.sepBg}` : 'none',
              }}>
                <span style={{ fontSize: '13px', color: C.textoSec }}>{k}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: C.textoPrim, fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}

            {/* Rendimientos destacados */}
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: C.naranjaLight, border: `1px solid ${C.naranjaFade}`,
                borderRadius: '8px', padding: '10px 14px',
              }}>
                <span style={{ fontSize: '12px', color: C.naranjaOsc, fontWeight: 700 }}>Rend. húmedo</span>
                <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: C.naranja }}>
                  {Math.round(ultimaCosecha.rendimientoHumedoKgHa).toLocaleString('es-AR')}
                  <span style={{ fontSize: '13px', color: C.naranjaOsc }}> kg/ha</span>
                </span>
              </div>

              {ultimaCosecha.rendimientoBaseHumedadComercialKgHa !== undefined && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: C.verdeLight, border: '1px solid #7DCE9F',
                  borderRadius: '8px', padding: '10px 14px',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#007A3D', fontWeight: 700 }}>Rend. base hum. comerc.</p>
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: C.textoTer }}>
                      hum. {ultimaCosecha.humedadComercializacionPct}% · muestra {ultimaCosecha.humedadMuestraPct}%
                    </p>
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: C.verde }}>
                    {Math.round(ultimaCosecha.rendimientoBaseHumedadComercialKgHa).toLocaleString('es-AR')}
                    <span style={{ fontSize: '13px', color: '#007A3D' }}> kg/ha</span>
                  </span>
                </div>
              )}

              {ultimaCosecha.pmgPromedio !== undefined && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: C.paginaBg, border: `1px solid ${C.borde}`,
                  borderRadius: '8px', padding: '10px 14px',
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: C.textoSec, fontWeight: 700 }}>
                      PMG promedio
                    </span>
                    {/* Detalle: peso 100 granos y PMG por muestra */}
                    {[
                      { p100: ultimaCosecha.peso100S1, pmg: ultimaCosecha.pmgS1, lbl: 'S1' },
                      { p100: ultimaCosecha.peso100S2, pmg: ultimaCosecha.pmgS2, lbl: 'S2' },
                      { p100: ultimaCosecha.peso100S3, pmg: ultimaCosecha.pmgS3, lbl: 'S3' },
                    ].filter(x => x.p100 !== undefined).map(x => (
                      <p key={x.lbl} style={{ margin: '2px 0 0', fontSize: '11px', color: C.textoTer, fontFamily: 'monospace' }}>
                        {x.lbl}: {x.p100} g × 10 = {x.pmg?.toFixed(1)} g
                      </p>
                    ))}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: C.textoPrim }}>
                    {ultimaCosecha.pmgPromedio.toFixed(1)} <span style={{ fontSize: '12px', color: C.textoSec }}>g</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {registrosSesion.length > 1 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: C.textoTer, fontWeight: 600 }}>
            {registrosSesion.length} registros guardados localmente
          </p>
        )}

        <button style={s.btn} onClick={abrirCosecha}>Nueva cosecha</button>

        <button style={s.btnSecondary} onClick={() => setPantalla('modulos')}>
          ← Volver a módulos
        </button>

        <button style={s.btnSecondary} onClick={handleReset}>
          ← Cambiar contexto
        </button>
      </div>
    </div>
  )

  // Fallback — no debería llegar aquí
  return null
}
