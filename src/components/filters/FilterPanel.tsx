'use client'
// components/filters/FilterPanel.tsx
import { type GridFilters, type Centro, type EstadoSemaforo } from '@/lib/types'

interface FilterPanelProps {
  filters: GridFilters
  onChange: (f: GridFilters) => void
  jefes: string[]
  ffs: string[]
  dependencias: string[]
  estados: string[]
  totalFiltered: number
  totalAll: number
  onExport: () => void
}

const SEMAFOROS = [
  { value: '',        label: 'Todos los estados' },
  { value: 'rojo',    label: '🔴 Crítico' },
  { value: 'amarillo',label: '🟡 Advertencia' },
  { value: 'verde',   label: '🟢 Normal' },
]

const CENTROS = [
  { value: '',          label: 'Todos los centros' },
  { value: 'rayentue',  label: 'Rayentué' },
  { value: 'hidango',   label: 'Hidango' },
  { value: 'raihuen',   label: 'Raihuén' },
  { value: 'cauquenes', label: 'Cauquenes' },
]

export default function FilterPanel({
  filters, onChange, jefes, ffs, dependencias, estados,
  totalFiltered, totalAll, onExport,
}: FilterPanelProps) {

  const set = <K extends keyof GridFilters>(key: K, value: GridFilters[K]) =>
    onChange({ ...filters, [key]: value })

  const hasActiveFilters = filters.jefe_proyecto || filters.ff ||
    filters.dependencia || filters.semaforo || filters.centro || filters.estado_proyecto

  const clearFilters = () => onChange({
    search: filters.search,
    jefe_proyecto: '', ff: '', dependencia: '', semaforo: '', centro: '', estado_proyecto: '',
  })

  return (
    <div>
      {/* Barra superior de herramientas */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            Portafolio de Proyectos
          </span>
          <span style={{
            background: 'var(--azul-gobierno-pale)', color: 'var(--azul-gobierno-mid)',
            fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
          }}>
            {totalFiltered.toLocaleString('es-CL')}
          </span>
          {hasActiveFilters && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              de {totalAll.toLocaleString('es-CL')} total
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasActiveFilters && (
            <button className="btn btn-sm btn-secondary" onClick={clearFilters} id="clear-filters-btn">
              ✕ Limpiar filtros
            </button>
          )}
          <button className="btn btn-sm btn-secondary" onClick={onExport} id="export-csv-btn">
            ⬇ Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        {/* Semáforo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">Estado:</span>
          <select
            id="filter-semaforo"
            className="filter-select"
            value={filters.semaforo}
            onChange={e => set('semaforo', e.target.value as EstadoSemaforo | '')}
          >
            {SEMAFOROS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Centro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">Centro:</span>
          <select
            id="filter-centro"
            className="filter-select"
            value={filters.centro}
            onChange={e => set('centro', e.target.value as Centro | '')}
          >
            {CENTROS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Jefe de Proyecto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">Jefe:</span>
          <select
            id="filter-jefe"
            className="filter-select"
            value={filters.jefe_proyecto}
            onChange={e => set('jefe_proyecto', e.target.value)}
          >
            <option value="">Todos</option>
            {jefes.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>

        {/* FF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">FF:</span>
          <select
            id="filter-ff"
            className="filter-select"
            value={filters.ff}
            onChange={e => set('ff', e.target.value)}
          >
            <option value="">Todas</option>
            {ffs.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Dependencia */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">Dependencia:</span>
          <select
            id="filter-dependencia"
            className="filter-select"
            value={filters.dependencia}
            onChange={e => set('dependencia', e.target.value)}
          >
            <option value="">Todas</option>
            {dependencias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Estado Proyecto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="filter-label">Estado Proy.:</span>
          <select
            id="filter-estado"
            className="filter-select"
            value={filters.estado_proyecto}
            onChange={e => set('estado_proyecto', e.target.value)}
          >
            <option value="">Todos</option>
            {estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
