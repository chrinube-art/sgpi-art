// lib/cat/validator.ts
// Motor de validación de Carga Anual de Trabajo (CAT)
import { type CatEntry, type CatResumen } from '@/lib/types'

const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'] as const
type Mes = typeof MESES[number]

const MES_KEYS: Record<Mes, keyof CatEntry> = {
  ENE: 'ene', FEB: 'feb', MAR: 'mar', ABR: 'abr',
  MAY: 'may', JUN: 'jun', JUL: 'jul', AGO: 'ago',
  SEP: 'sep', OCT: 'oct', NOV: 'nov', DIC: 'dic',
}

/**
 * Agrupa las entradas CAT por RUT y calcula la carga mensual total.
 * Si un investigador supera 100% en cualquier mes → sobreasignado = true.
 */
export function calcularResumenCAT(entries: CatEntry[]): CatResumen[] {
  // Agrupar por RUT
  const byRut = new Map<string, { entry: CatEntry; meses: Record<Mes, number> }[]>()

  for (const entry of entries) {
    const rut = (entry.rut ?? '').trim()
    if (!rut) continue
    if (!byRut.has(rut)) byRut.set(rut, [])
    const mesValues = {} as Record<Mes, number>
    for (const mes of MESES) {
      const key = MES_KEYS[mes]
      const val = Number(entry[key]) || 0
      mesValues[mes] = val
    }
    byRut.get(rut)!.push({ entry, meses: mesValues })
  }

  // Consolidar por investigador
  const resumen: CatResumen[] = []

  for (const [rut, rows] of byRut.entries()) {
    const totalMeses: Record<Mes, number> = {} as Record<Mes, number>
    for (const mes of MESES) {
      totalMeses[mes] = rows.reduce((s, r) => s + (r.meses[mes] ?? 0), 0)
    }

    const mesesConProblema = MESES.filter(m => totalMeses[m] > 100)
    const sobreasignado = mesesConProblema.length > 0

    const firstEntry = rows[0].entry
    resumen.push({
      rut,
      empleado: firstEntry.empleado ?? rut,
      dep_empleado: firstEntry.dep_empleado,
      meses: Object.fromEntries(MESES.map(m => [m, totalMeses[m]])),
      sobreasignado,
      mesesConProblema,
    })
  }

  // Ordenar: sobreasignados primero, luego alfabético
  resumen.sort((a, b) => {
    if (a.sobreasignado !== b.sobreasignado) return a.sobreasignado ? -1 : 1
    return a.empleado.localeCompare(b.empleado)
  })

  return resumen
}

/**
 * Determina el color de una celda del heatmap
 */
export function catCellClass(valor: number): string {
  if (valor === 0)    return 'empty'
  if (valor > 100)    return 'over'
  if (valor >= 80)    return 'high'
  if (valor >= 40)    return 'medium'
  return 'low'
}

export const MESES_LABELS = MESES
