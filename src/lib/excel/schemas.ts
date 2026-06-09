// lib/excel/schemas.ts
// Esquemas rígidos para validación de importación de Excel SGPI-INIA

export const BBDD_REQUIRED_COLUMNS = [
  'Dependencia',
  'Código',
  'Nombre FF',
  'FF',
  'Estado Código',
  'Estado Formulario',
  'Estado Acta Inicio',
  'Estado Contrato',
  'Título Proyecto',
  'Jefe Proyecto',
  'Estado Proyecto',
  'Desde',
  'Hasta',
  'MONTO FF',
  'PECUNIO ASOCIADO',
  'NO PECUNIO ASOCIADO',
  'PECUNIO INIA',
  'NO PECUNIO INIA',
  'TOTAL PROYECTO',
  'Código Externo',
] as const

export const CAT_REQUIRED_COLUMNS = [
  'Codigo proyecto',
  'Título de proyecto',
  'Año',
  'Cód. Dep. Empleado',
  'Dep. Empleado',
  'Empleado',
  'RUT',
  'Tipo Financiamiento',
  'Código Proyecto',
  'Cód. Dep.',
  'Dependencia',
  'Cód. FF',
  'Fuente Financiamiento',
  'Estado Proyecto',
  'ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC',
] as const

export const CUOTAS_REQUIRED_COLUMNS = [
  'Código',
  'CRI',
  'FF',
  'Título proyecto',
  'Estado',
  'Jefe Proyecto',
  'Contrato',
  'Nombre Contrato',
  'Fuente Financiamiento',
  'Cuota',
  'Monto',
  'Fecha Ingreso Cuotas',
  'Año ingreso cuota',
  'Mes ingreso cuota',
  'Fecha Término Contrato',
  'Fecha Ingreso',
  'Ingresado SGPI',
  'Monto Recibido',
] as const

export type SheetType = 'bbdd' | 'cat' | 'cuotas'

export function detectSheetType(sheetName: string): SheetType | null {
  const n = sheetName.toLowerCase()
  if (n.includes('bbdd') || n.includes('base de datos')) return 'bbdd'
  if (n.includes('cat')) return 'cat'
  if (n.includes('cuota')) return 'cuotas'
  return null
}

export function getRequiredColumns(type: SheetType): readonly string[] {
  const map: Record<SheetType, readonly string[]> = {
    bbdd:   BBDD_REQUIRED_COLUMNS,
    cat:    CAT_REQUIRED_COLUMNS,
    cuotas: CUOTAS_REQUIRED_COLUMNS,
  }
  return map[type]
}

/**
 * Valida que las columnas del encabezado contengan
 * todas las requeridas por el esquema.
 * Retorna las columnas faltantes (array vacío = sin errores).
 */
export function validateColumns(
  headers: string[],
  type: SheetType
): string[] {
  const required = getRequiredColumns(type)
  const headerSet = new Set(headers.map(h => h.trim()))
  return required.filter(col => !headerSet.has(col))
}
