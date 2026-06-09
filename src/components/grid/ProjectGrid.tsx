'use client'
// components/grid/ProjectGrid.tsx
// Grilla analítica principal con TanStack Table + semáforos integrados
import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table'
import { type Project, type GridFilters } from '@/lib/types'
import { aplicarSemaforos, semaforoLabel } from '@/lib/semaforo/engine'
import { formatCLP, formatDate, labelDiasRestantes, truncate } from '@/lib/utils/format'
import FilterPanel from '@/components/filters/FilterPanel'
import CuotasModal from '@/components/modals/CuotasModal'

interface ProjectGridProps {
  data: Project[]
  isAdmin?: boolean
  onExportCSV?: () => void
}

function SemaforoBadge({ valor }: { valor?: string }) {
  if (!valor) return <span className="semaforo"><span className="dot" />—</span>
  const labels: Record<string, string> = {
    rojo: 'Crítico', amarillo: 'Advertencia', verde: 'Normal', sin_dato: 'Sin datos',
  }
  return (
    <span className={`semaforo ${valor}`}>
      <span className="dot" />
      {labels[valor] ?? valor}
    </span>
  )
}

export default function ProjectGrid({ data, isAdmin, onExportCSV }: ProjectGridProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<GridFilters>({
    search: '', jefe_proyecto: '', ff: '', dependencia: '', semaforo: '', centro: '', estado_proyecto: '',
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [pageSize, setPageSize] = useState(20)

  // Aplicar semáforos
  const enriched = useMemo(() => aplicarSemaforos(data), [data])

  // Filtrado cliente
  const filtered = useMemo(() => {
    return enriched.filter(p => {
      const s = filters.search.toLowerCase()
      if (s && !(
        p.codigo_proyecto.toLowerCase().includes(s) ||
        p.titulo_proyecto.toLowerCase().includes(s) ||
        (p.jefe_proyecto ?? '').toLowerCase().includes(s) ||
        (p.ff ?? '').toLowerCase().includes(s)
      )) return false
      if (filters.jefe_proyecto && p.jefe_proyecto !== filters.jefe_proyecto) return false
      if (filters.ff && p.ff !== filters.ff) return false
      if (filters.dependencia && p.dependencia !== filters.dependencia) return false
      if (filters.semaforo && p.semaforo !== filters.semaforo) return false
      if (filters.centro && p.centro_propietario !== filters.centro) return false
      if (filters.estado_proyecto && p.estado_proyecto !== filters.estado_proyecto) return false
      return true
    })
  }, [enriched, filters])

  // Opciones únicas para filtros
  const uniqueJefes       = useMemo(() => [...new Set(enriched.map(p => p.jefe_proyecto).filter(Boolean))].sort() as string[], [enriched])
  const uniqueFF          = useMemo(() => [...new Set(enriched.map(p => p.ff).filter(Boolean))].sort() as string[], [enriched])
  const uniqueDependencias= useMemo(() => [...new Set(enriched.map(p => p.dependencia).filter(Boolean))].sort() as string[], [enriched])
  const uniqueEstados     = useMemo(() => [...new Set(enriched.map(p => p.estado_proyecto).filter(Boolean))].sort() as string[], [enriched])

  const columns = useMemo<ColumnDef<Project>[]>(() => [
    {
      id: 'semaforo',
      header: 'Estado',
      accessorKey: 'semaforo',
      cell: ({ row }) => <SemaforoBadge valor={row.original.semaforo} />,
      size: 120,
    },
    {
      id: 'codigo',
      header: 'Código',
      accessorKey: 'codigo_proyecto',
      cell: ({ getValue }) => <span className="td-code">{String(getValue())}</span>,
      size: 130,
    },
    {
      id: 'titulo',
      header: 'Título del Proyecto',
      accessorKey: 'titulo_proyecto',
      cell: ({ getValue }) => (
        <span title={String(getValue())} style={{ display: 'block' }}>
          {truncate(String(getValue()), 55)}
        </span>
      ),
      size: 280,
    },
    {
      id: 'jefe',
      header: 'Jefe de Proyecto',
      accessorKey: 'jefe_proyecto',
      cell: ({ getValue }) => (
        <span style={{ fontWeight: 500 }}>{String(getValue() ?? '—')}</span>
      ),
      size: 160,
    },
    {
      id: 'ff',
      header: 'FF',
      accessorKey: 'ff',
      size: 80,
    },
    {
      id: 'estado_proyecto',
      header: 'Estado',
      accessorKey: 'estado_proyecto',
      cell: ({ getValue }) => {
        const v = String(getValue() ?? '')
        let cls = 'badge-gray'
        if (v.toLowerCase().includes('ejecuci')) cls = 'badge-verde'
        else if (v.toLowerCase().includes('negociaci')) cls = 'badge-amarillo'
        else if (v.toLowerCase().includes('terminad')) cls = 'badge-azul'
        return <span className={`badge ${cls}`}>{v || '—'}</span>
      },
      size: 120,
    },
    {
      id: 'desde',
      header: 'Desde',
      accessorKey: 'desde',
      cell: ({ getValue }) => formatDate(String(getValue() ?? '')),
      size: 100,
    },
    {
      id: 'hasta',
      header: 'Hasta',
      accessorKey: 'hasta',
      cell: ({ getValue }) => {
        const v = String(getValue() ?? '')
        const label = labelDiasRestantes(v)
        const dias = label.includes('Vencido') ? 'rojo' : label.includes('d') && parseInt(label) <= 30 ? 'amarillo' : ''
        return <span style={{ color: dias === 'rojo' ? 'var(--rojo-alerta)' : dias === 'amarillo' ? 'var(--amarillo-alerta)' : 'inherit', fontWeight: dias ? 600 : 400 }}>{label}</span>
      },
      size: 100,
    },
    {
      id: 'total',
      header: 'Total Proyecto',
      accessorKey: 'total_proyecto',
      cell: ({ getValue }) => (
        <span className="td-monto">{formatCLP(Number(getValue()))}</span>
      ),
      size: 140,
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setSelectedProject(row.original)}
            title="Ver cuotas"
            id={`btn-cuotas-${row.original.codigo_proyecto}`}
          >
            💰
          </button>
          <button
            className="btn btn-sm btn-secondary"
            title="Ver detalle"
            id={`btn-detalle-${row.original.codigo_proyecto}`}
          >
            📋
          </button>
        </div>
      ),
      size: 80,
      enableSorting: false,
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  const exportCSV = useCallback(() => {
    if (onExportCSV) { onExportCSV(); return }
    const headers = ['Código','Título','Jefe Proyecto','FF','Estado','Desde','Hasta','Total Proyecto','Semáforo']
    const rows = filtered.map(p => [
      p.codigo_proyecto,
      `"${(p.titulo_proyecto ?? '').replace(/"/g,'""')}"`,
      p.jefe_proyecto ?? '',
      p.ff ?? '',
      p.estado_proyecto ?? '',
      p.desde ?? '',
      p.hasta ?? '',
      p.total_proyecto ?? '',
      semaforoLabel(p.semaforo ?? 'sin_dato'),
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `proyectos_sgpi_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [filtered, onExportCSV])

  return (
    <>
      <div className="card" style={{ marginBottom: 24 }}>
        {/* Barra de filtros */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          jefes={uniqueJefes}
          ffs={uniqueFF}
          dependencias={uniqueDependencias}
          estados={uniqueEstados}
          totalFiltered={filtered.length}
          totalAll={enriched.length}
          onExport={exportCSV}
        />

        {/* Tabla */}
        <div className="table-container" style={{ maxHeight: '62vh' }}>
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={header.column.getIsSorted() ? 'sorted' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="sort-icon">
                          {header.column.getIsSorted() === 'asc' ? '▲' :
                           header.column.getIsSorted() === 'desc' ? '▼' : '⇅'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <div className="empty-title">Sin resultados</div>
                      <div className="empty-text">No se encontraron proyectos con los filtros aplicados.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ maxWidth: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {table.getState().pagination.pageIndex * pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, filtered.length)} de{' '}
            <strong>{filtered.length}</strong> proyectos
            {filtered.length !== enriched.length && ` (filtrado de ${enriched.length})`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              Filas:
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="filter-select"
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="pagination-controls">
              <button className="page-btn" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>«</button>
              <button className="page-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>

              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const page = Math.max(0, table.getState().pagination.pageIndex - 2) + i
                if (page >= table.getPageCount()) return null
                return (
                  <button
                    key={page}
                    className={`page-btn ${table.getState().pagination.pageIndex === page ? 'active' : ''}`}
                    onClick={() => table.setPageIndex(page)}
                  >
                    {page + 1}
                  </button>
                )
              })}

              <button className="page-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
              <button className="page-btn" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cuotas */}
      {selectedProject && (
        <CuotasModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}
