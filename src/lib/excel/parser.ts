// lib/excel/parser.ts
// Parser de archivos Excel para importación SGPI-INIA
import * as XLSX from 'xlsx'
import { validateColumns, detectSheetType, type SheetType } from './schemas'
import { type ImportResult, type ImportError, type Project, type CatEntry, type Cuota } from '@/lib/types'

function parseCLP(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  const str = String(val).replace(/[$\s.]/g, '').replace(',', '.')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function parseDate(val: unknown): string | undefined {
  if (!val) return undefined
  if (typeof val === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(val)
    if (!date) return undefined
    const y = date.y
    const m = String(date.m).padStart(2, '0')
    const d = String(date.d).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'string') {
    const parts = val.split('/')
    if (parts.length === 3) {
      const [d, m, y] = parts
      return `${y.padStart(4,'20')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
    }
    return val
  }
  return String(val)
}

// ── Parser BBDD ──────────────────────────────────────────────────
export function parseBBDD(rows: Record<string, unknown>[]): Project[] {
  return rows
    .filter(r => r['Código'] || r['Título Proyecto'])
    .map(r => ({
      codigo_proyecto:   String(r['Código'] ?? '').trim(),
      nombre_ff:         String(r['Nombre FF'] ?? '').trim(),
      ff:                String(r['FF'] ?? '').trim(),
      estado_codigo:     String(r['Estado Código'] ?? '').trim(),
      estado_formulario: String(r['Estado Formulario'] ?? '').trim(),
      estado_acta_inicio:String(r['Estado Acta Inicio'] ?? '').trim(),
      estado_contrato:   String(r['Estado Contrato'] ?? '').trim(),
      titulo_proyecto:   String(r['Título Proyecto'] ?? '').trim(),
      jefe_proyecto:     String(r['Jefe Proyecto'] ?? '').trim(),
      estado_proyecto:   String(r['Estado Proyecto'] ?? '').trim(),
      dependencia:       String(r['Dependencia'] ?? '').trim(),
      desde:             parseDate(r['Desde']),
      hasta:             parseDate(r['Hasta']),
      monto_ff:          parseCLP(r['MONTO FF']),
      pecunio_asociado:  parseCLP(r['PECUNIO ASOCIADO']),
      no_pecunio_asociado: parseCLP(r['NO PECUNIO ASOCIADO']),
      pecunio_inia:      parseCLP(r['PECUNIO INIA']),
      no_pecunio_inia:   parseCLP(r['NO PECUNIO INIA']),
      total_proyecto:    parseCLP(r['TOTAL PROYECTO']),
      codigo_externo:    String(r['Código Externo'] ?? '').trim(),
    }))
    .filter(p => p.codigo_proyecto.length > 0)
}

// ── Parser CAT ───────────────────────────────────────────────────
export function parseCAT(rows: Record<string, unknown>[]): CatEntry[] {
  return rows
    .filter(r => r['RUT'] || r['Empleado'])
    .map(r => ({
      codigo_proyecto:    String(r['Codigo proyecto'] ?? r['Código Proyecto'] ?? '').trim(),
      titulo_proyecto:    String(r['Título de proyecto'] ?? '').trim(),
      anio:               Number(r['Año']) || new Date().getFullYear(),
      cod_dep_empleado:   String(r['Cód. Dep. Empleado'] ?? '').trim(),
      dep_empleado:       String(r['Dep. Empleado'] ?? '').trim(),
      empleado:           String(r['Empleado'] ?? '').trim(),
      rut:                String(r['RUT'] ?? '').trim(),
      tipo_financiamiento:String(r['Tipo Financiamiento'] ?? '').trim(),
      cod_dep:            String(r['Cód. Dep.'] ?? '').trim(),
      dependencia:        String(r['Dependencia'] ?? '').trim(),
      cod_ff:             String(r['Cód. FF'] ?? '').trim(),
      fuente_financiamiento: String(r['Fuente Financiamiento'] ?? '').trim(),
      estado_proyecto:    String(r['Estado Proyecto'] ?? '').trim(),
      ene: Number(r['ENE']) || 0,
      feb: Number(r['FEB']) || 0,
      mar: Number(r['MAR']) || 0,
      abr: Number(r['ABR']) || 0,
      may: Number(r['MAY']) || 0,
      jun: Number(r['JUN']) || 0,
      jul: Number(r['JUL']) || 0,
      ago: Number(r['AGO']) || 0,
      sep: Number(r['SEP']) || 0,
      oct: Number(r['OCT']) || 0,
      nov: Number(r['NOV']) || 0,
      dic: Number(r['DIC']) || 0,
    }))
}

// ── Parser Cuotas ─────────────────────────────────────────────────
export function parseCuotas(rows: Record<string, unknown>[]): Cuota[] {
  return rows
    .filter(r => r['Código'])
    .map(r => ({
      codigo_proyecto:       String(r['Código'] ?? '').trim(),
      cri:                   String(r['CRI'] ?? '').trim(),
      ff:                    String(r['FF'] ?? '').trim(),
      titulo_proyecto:       String(r['Título proyecto'] ?? '').trim(),
      estado:                String(r['Estado'] ?? '').trim(),
      jefe_proyecto:         String(r['Jefe Proyecto'] ?? '').trim(),
      contrato:              String(r['Contrato'] ?? '').trim(),
      nombre_contrato:       String(r['Nombre Contrato'] ?? '').trim(),
      fuente_financiamiento: String(r['Fuente Financiamiento'] ?? '').trim(),
      cuota:                 Number(r['Cuota']) || undefined,
      monto:                 parseCLP(r['Monto']),
      fecha_ingreso_cuotas:  parseDate(r['Fecha Ingreso Cuotas']),
      anio_ingreso_cuota:    Number(r['Año ingreso cuota']) || undefined,
      mes_ingreso_cuota:     Number(r['Mes ingreso cuota']) || undefined,
      fecha_termino_contrato:parseDate(r['Fecha Término Contrato']),
      fecha_ingreso:         parseDate(r['Fecha Ingreso']),
      ingresado_sgpi:        String(r['Ingresado SGPI'] ?? '').toLowerCase() === 'si' ||
                             String(r['Ingresado SGPI'] ?? '').toLowerCase() === 'sí' ||
                             r['Ingresado SGPI'] === true,
      monto_recibido:        parseCLP(r['Monto Recibido']),
    }))
}

// ── Procesador principal ──────────────────────────────────────────
export interface ParsedWorkbook {
  bbdd: Project[]
  cat: CatEntry[]
  cuotas: Cuota[]
  results: ImportResult[]
}

export function processWorkbook(buffer: ArrayBuffer): ParsedWorkbook {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const parsed: ParsedWorkbook = { bbdd: [], cat: [], cuotas: [], results: [] }

  for (const sheetName of wb.SheetNames) {
    const sheetType = detectSheetType(sheetName)
    if (!sheetType) continue

    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: '',
      raw: true,
    })

    if (rows.length === 0) {
      parsed.results.push({
        success: false,
        errors: [{ type: 'schema_mismatch', message: `La hoja "${sheetName}" está vacía.` }],
        warnings: [],
        rowsImported: 0,
        sheetType,
      })
      continue
    }

    const headers = Object.keys(rows[0])
    const missingCols = validateColumns(headers, sheetType)

    if (missingCols.length > 0) {
      parsed.results.push({
        success: false,
        errors: missingCols.map(col => ({
          type: 'missing_column' as const,
          message: `Columna requerida faltante: "${col}"`,
          column: col,
        })),
        warnings: [],
        rowsImported: 0,
        sheetType,
      })
      continue
    }

    // Parsear según tipo
    let rowsImported = 0
    const errors: ImportError[] = []

    try {
      if (sheetType === 'bbdd') {
        const data = parseBBDD(rows)
        parsed.bbdd.push(...data)
        rowsImported = data.length
      } else if (sheetType === 'cat') {
        const data = parseCAT(rows)
        parsed.cat.push(...data)
        rowsImported = data.length
      } else if (sheetType === 'cuotas') {
        const data = parseCuotas(rows)
        parsed.cuotas.push(...data)
        rowsImported = data.length
      }
    } catch (e) {
      errors.push({
        type: 'invalid_value',
        message: `Error al procesar la hoja "${sheetName}": ${String(e)}`,
      })
    }

    parsed.results.push({
      success: errors.length === 0,
      errors,
      warnings: [],
      rowsImported,
      sheetType,
    })
  }

  return parsed
}
