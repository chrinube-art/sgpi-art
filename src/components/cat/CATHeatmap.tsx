'use client'
// components/cat/CATHeatmap.tsx
// Panel de calor de Carga Anual de Trabajo por investigador
import { useMemo, useState } from 'react'
import { type CatEntry } from '@/lib/types'
import { calcularResumenCAT, catCellClass, MESES_LABELS } from '@/lib/cat/validator'

interface CATHeatmapProps {
  entries: CatEntry[]
  anio?: number
}

export default function CATHeatmap({ entries, anio }: CATHeatmapProps) {
  const [filtroSobre, setFiltroSobre] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const resumen = useMemo(() => calcularResumenCAT(entries), [entries])

  const filtered = useMemo(() => {
    return resumen.filter(r => {
      if (filtroSobre && !r.sobreasignado) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        return r.empleado.toLowerCase().includes(q) || r.rut.toLowerCase().includes(q)
      }
      return true
    })
  }, [resumen, filtroSobre, busqueda])

  const sobreasignadosCount = resumen.filter(r => r.sobreasignado).length

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">📊 Carga Anual de Trabajo (CAT) {anio ?? ''}</div>
          <div className="card-subtitle">
            Distribución mensual de participación por investigador
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {sobreasignadosCount > 0 && (
            <div className="alert alert-rojo" style={{ margin: 0, padding: '6px 12px', fontSize: 12 }}>
              🚨 <strong>{sobreasignadosCount}</strong> investigador{sobreasignadosCount > 1 ? 'es' : ''} sobrecargado{sobreasignadosCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Controles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="filter-input"
            placeholder="🔍 Buscar investigador o RUT…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: 260 }}
            id="cat-search"
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={filtroSobre}
              onChange={e => setFiltroSobre(e.target.checked)}
              style={{ accentColor: 'var(--rojo-alerta)' }}
              id="cat-filter-sobre"
            />
            Solo sobreasignados
          </label>

          {/* Leyenda */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
            {[
              { cls: 'empty',  label: '0%' },
              { cls: 'low',    label: '1–39%' },
              { cls: 'medium', label: '40–79%' },
              { cls: 'high',   label: '80–100%' },
              { cls: 'over',   label: '>100% 🚨' },
            ].map(l => (
              <div key={l.cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className={`cat-cell ${l.cls}`} style={{ width: 20, height: 20, borderRadius: 4, display: 'inline-block', padding: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">Sin datos de CAT</div>
            <div className="empty-text">Importe planillas de CAT para visualizar la carga mensual del equipo investigador.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div className="cat-heatmap" style={{ minWidth: 700 }}>
              {/* Encabezado de meses */}
              <div className="cat-header" style={{ textAlign: 'left', paddingLeft: 0 }}>Investigador</div>
              {MESES_LABELS.map(m => (
                <div key={m} className="cat-header">{m}</div>
              ))}

              {/* Filas por investigador */}
              {filtered.map(inv => (
                <>
                  <div key={`label-${inv.rut}`} className="cat-row-label">
                    <span style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}
                          title={inv.empleado}>
                      {inv.sobreasignado && '🚨 '}
                      {inv.empleado}
                    </span>
                    <span className="rut">{inv.rut}</span>
                    {inv.dep_empleado && <span className="rut" style={{ fontSize: 9 }}>{inv.dep_empleado}</span>}
                  </div>
                  {MESES_LABELS.map(mes => {
                    const val = inv.meses[mes] ?? 0
                    const cls = catCellClass(val)
                    return (
                      <div
                        key={`${inv.rut}-${mes}`}
                        className={`cat-cell ${cls}`}
                        title={`${inv.empleado} — ${mes}: ${val}%`}
                      >
                        {val > 0 ? `${val}%` : '—'}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div style={{ marginTop: 16, padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 20 }}>
          <span>👥 <strong style={{ color: 'var(--text-primary)' }}>{resumen.length}</strong> investigadores</span>
          <span>🚨 <strong style={{ color: 'var(--rojo-alerta)' }}>{sobreasignadosCount}</strong> sobrecargados</span>
          <span>✅ <strong style={{ color: 'var(--verde-inia)' }}>{resumen.length - sobreasignadosCount}</strong> sin problemas</span>
        </div>
      </div>
    </div>
  )
}
