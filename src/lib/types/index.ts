// lib/types/index.ts
// Tipos centrales del SGPI-INIA

export type Macrozona = 'ohiggins' | 'maule'
export type Centro = 'rayentue' | 'hidango' | 'raihuen' | 'cauquenes'
export type UserRole =
  | 'admin'
  | 'director_ohiggins'
  | 'director_maule'
  | 'investigador_ohiggins'
  | 'investigador_maule'

export type EstadoSemaforo = 'rojo' | 'amarillo' | 'verde' | 'sin_dato'

// ── Proyecto ────────────────────────────────────────────────────
export interface Project {
  codigo_proyecto: string         // PK inmutable
  nombre_ff?: string
  ff?: string                     // Fuente de Financiamiento (código)
  estado_codigo?: string
  estado_formulario?: string
  estado_acta_inicio?: string
  estado_contrato?: string
  titulo_proyecto: string
  jefe_proyecto?: string
  estado_proyecto?: string
  dependencia?: string
  desde?: string                  // ISO date string
  hasta?: string
  monto_ff?: number               // CLP
  pecunio_asociado?: number
  no_pecunio_asociado?: number
  pecunio_inia?: number
  no_pecunio_inia?: number
  total_proyecto?: number
  codigo_externo?: string
  macrozona?: Macrozona
  centro_propietario?: Centro
  created_at?: string
  updated_at?: string
  // Calculados en runtime
  semaforo?: EstadoSemaforo
  fecha_termino_contrato?: string // venida de tabla cuotas
}

// ── Cuota ────────────────────────────────────────────────────────
export interface Cuota {
  id?: number
  codigo_proyecto: string
  cri?: string
  ff?: string
  titulo_proyecto?: string
  estado?: string
  jefe_proyecto?: string
  contrato?: string
  nombre_contrato?: string
  fuente_financiamiento?: string
  cuota?: number
  monto?: number
  fecha_ingreso_cuotas?: string
  anio_ingreso_cuota?: number
  mes_ingreso_cuota?: number
  fecha_termino_contrato?: string
  fecha_ingreso?: string
  ingresado_sgpi?: boolean
  monto_recibido?: number
}

// ── CAT Entry ────────────────────────────────────────────────────
export interface CatEntry {
  id?: number
  codigo_proyecto: string
  titulo_proyecto?: string
  anio: number
  cod_dep_empleado?: string
  dep_empleado?: string
  empleado: string
  rut: string
  tipo_financiamiento?: string
  cod_dep?: string
  dependencia?: string
  cod_ff?: string
  fuente_financiamiento?: string
  estado_proyecto?: string
  ene?: number; feb?: number; mar?: number; abr?: number
  may?: number; jun?: number; jul?: number; ago?: number
  sep?: number; oct?: number; nov?: number; dic?: number
  snapshot_id?: number
}

// ── Resumen CAT por Investigador ─────────────────────────────────
export interface CatResumen {
  rut: string
  empleado: string
  dep_empleado?: string
  meses: { [mes: string]: number } // { 'ENE': 45, 'FEB': 80, ... }
  sobreasignado: boolean
  mesesConProblema: string[]
}

// ── Snapshot ─────────────────────────────────────────────────────
export interface Snapshot {
  id: number
  periodo: string      // 'YYYY-MM'
  cerrado_por?: string
  cerrado_at: string
  is_locked: boolean
}

// ── Excel Import ─────────────────────────────────────────────────
export interface ImportResult {
  success: boolean
  errors: ImportError[]
  warnings: string[]
  rowsImported: number
  sheetType: 'bbdd' | 'cat' | 'cuotas'
}

export interface ImportError {
  type: 'missing_column' | 'invalid_value' | 'duplicate_key' | 'schema_mismatch'
  message: string
  column?: string
  row?: number
}

// ── KPI Dashboard ─────────────────────────────────────────────────
export interface DashboardKPIs {
  totalProyectos: number
  proyectosEjecucion: number
  alertasRojas: number
  alertasAmarillas: number
  montoTotal: number
  proyectosPorCentro: { centro: string; count: number }[]
}

// ── Filtros de Grilla ─────────────────────────────────────────────
export interface GridFilters {
  search: string
  jefe_proyecto: string
  ff: string
  dependencia: string
  semaforo: EstadoSemaforo | ''
  centro: Centro | ''
  estado_proyecto: string
}
