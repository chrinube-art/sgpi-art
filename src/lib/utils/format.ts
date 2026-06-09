// lib/utils/format.ts
// Utilidades de formateo para SGPI-INIA

/**
 * Formatea un número como moneda CLP
 */
export function formatCLP(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un número compacto (para KPIs)
 */
export function formatCompact(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) return '—'
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return formatCLP(value)
}

/**
 * Formatea una fecha ISO como DD/MM/YYYY
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

/**
 * Días restantes desde hoy hasta una fecha
 */
export function diasRestantes(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - hoy.getTime()) / 86_400_000)
}

/**
 * Label de días restantes
 */
export function labelDiasRestantes(dateStr?: string | null): string {
  const dias = diasRestantes(dateStr)
  if (dias === null) return '—'
  if (dias < 0) return `Vencido (${Math.abs(dias)}d)`
  if (dias === 0) return 'Vence hoy'
  if (dias <= 30) return `${dias}d`
  return formatDate(dateStr)
}

/**
 * Nombre de centro legible
 */
export function centroLabel(centro?: string): string {
  const map: Record<string, string> = {
    rayentue: 'Rayentué',
    hidango:  'Hidango',
    raihuen:  'Raihuén',
    cauquenes:'Cauquenes',
  }
  return centro ? (map[centro] ?? centro) : '—'
}

/**
 * Nombre de macrozona legible
 */
export function macrozonaLabel(zona?: string): string {
  const map: Record<string, string> = {
    ohiggins: "Zona O'Higgins",
    maule:    'Zona Maule',
  }
  return zona ? (map[zona] ?? zona) : '—'
}

/**
 * Truncar texto largo con ellipsis
 */
export function truncate(str: string, max = 40): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

/**
 * Porcentaje con 1 decimal
 */
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}
