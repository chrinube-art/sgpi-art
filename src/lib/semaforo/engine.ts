// lib/semaforo/engine.ts
// Motor de cálculo de semáforos de gestión SGPI-INIA
import { type Project, type EstadoSemaforo } from '@/lib/types'

const DIAS_CRITICO = 30      // días para semáforo rojo por contrato
const DIAS_ADVERTENCIA = 90  // días para semáforo amarillo

function daysDiff(dateStr?: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - hoy.getTime()) / 86_400_000)
}

function isNegociacion(estado?: string): boolean {
  if (!estado) return false
  const s = estado.toLowerCase().trim()
  return s.includes('negociaci') || s.includes('sin informaci')
}

function isSinInformacion(estado?: string): boolean {
  if (!estado) return false
  return estado.toLowerCase().trim().includes('sin informaci')
}

/**
 * Calcula el semáforo de gestión según las reglas del SGPI-INIA:
 *
 * 🔴 Rojo (Crítico):
 *   - Estado Contrato o Estado Código = "Negociación" / "Sin Información"
 *     Y la fecha `desde` ≤ hoy
 *   - O bien fecha_termino_contrato vencida o < 30 días
 *
 * 🟡 Amarillo (Advertencia):
 *   - Estado = "En Ejecución" Y (hasta | fecha_termino_contrato) ≤ 90 días
 *
 * 🟢 Verde (Normal):
 *   - Holgura > 90 días, todo en regla
 */
export function calcularSemaforo(project: Project): EstadoSemaforo {
  const estadoContrato = project.estado_contrato ?? ''
  const estadoCodigo   = project.estado_codigo   ?? ''
  const estadoProyecto = project.estado_proyecto  ?? ''

  const diasDesde          = daysDiff(project.desde)
  const diasHasta          = daysDiff(project.hasta)
  const diasTermContrato   = daysDiff(project.fecha_termino_contrato)

  // ── ROJO ───────────────────────────────────────────────────────
  // 1. Negociación/Sin Información con fecha de inicio ya cumplida
  if (
    (isNegociacion(estadoContrato) || isNegociacion(estadoCodigo) ||
     isSinInformacion(estadoContrato) || isSinInformacion(estadoCodigo)) &&
    diasDesde !== null && diasDesde <= 0
  ) return 'rojo'

  // 2. Contrato vencido o a menos de 30 días
  if (diasTermContrato !== null && diasTermContrato <= DIAS_CRITICO) return 'rojo'

  // 3. Fecha hasta vencida y proyecto en estados problemáticos
  if (diasHasta !== null && diasHasta < 0) return 'rojo'

  // ── AMARILLO ───────────────────────────────────────────────────
  const enEjecucion = estadoProyecto.toLowerCase().includes('ejecuci')
  if (enEjecucion) {
    if (diasHasta !== null && diasHasta <= DIAS_ADVERTENCIA) return 'amarillo'
    if (diasTermContrato !== null && diasTermContrato <= DIAS_ADVERTENCIA) return 'amarillo'
  }

  // También amarillo si negociación pero con fecha inicio futura
  if (
    (isNegociacion(estadoContrato) || isNegociacion(estadoCodigo)) &&
    diasDesde !== null && diasDesde > 0
  ) return 'amarillo'

  // ── VERDE ──────────────────────────────────────────────────────
  return 'verde'
}

/**
 * Aplica el cálculo de semáforo a un arreglo de proyectos
 */
export function aplicarSemaforos(projects: Project[]): Project[] {
  return projects.map(p => ({ ...p, semaforo: calcularSemaforo(p) }))
}

/**
 * Cuenta las alertas por tipo
 */
export function contarAlertas(projects: Project[]): {
  rojo: number; amarillo: number; verde: number
} {
  return projects.reduce(
    (acc, p) => {
      const s = p.semaforo ?? calcularSemaforo(p)
      acc[s as 'rojo' | 'amarillo' | 'verde'] = (acc[s as 'rojo' | 'amarillo' | 'verde'] ?? 0) + 1
      return acc
    },
    { rojo: 0, amarillo: 0, verde: 0 }
  )
}

/**
 * Label legible del semáforo
 */
export function semaforoLabel(s: EstadoSemaforo): string {
  const map: Record<EstadoSemaforo, string> = {
    rojo:     'Crítico',
    amarillo: 'Advertencia',
    verde:    'Normal',
    sin_dato: 'Sin datos',
  }
  return map[s]
}
