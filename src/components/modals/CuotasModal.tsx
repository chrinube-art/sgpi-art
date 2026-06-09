'use client'
// components/modals/CuotasModal.tsx
import { useState, useEffect } from 'react'
import { type Project, type Cuota } from '@/lib/types'
import { formatCLP, formatDate } from '@/lib/utils/format'
import { getCuotasByProject } from '@/app/actions/cuotas'

interface CuotasModalProps {
  project: Project
  onClose: () => void
}

export default function CuotasModal({ project, onClose }: CuotasModalProps) {
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCuotas = async () => {
      try {
        const data = await getCuotasByProject(project.codigo_proyecto)
        setCuotas(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadCuotas()
  }, [project.codigo_proyecto])

  const totalMonto    = cuotas.reduce((s, c) => s + (c.monto ?? 0), 0)
  const totalRecibido = cuotas.reduce((s, c) => s + (c.monto_recibido ?? 0), 0)
  const pendiente     = totalMonto - totalRecibido
  const sgpiPendientes = cuotas.filter(c => !c.ingresado_sgpi).length

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div className="modal-title">💰 Cuotas e Informes</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              <span className="td-code" style={{ fontSize: 11 }}>{project.codigo_proyecto}</span>
              {' '}{project.titulo_proyecto}
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            id="close-cuotas-modal"
            style={{ fontSize: 18, borderRadius: '50%' }}
          >✕</button>
        </div>

        <div className="modal-body">
          {/* KPIs rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Cuotas', value: cuotas.length, cls: 'azul', icon: '📋' },
              { label: 'Monto Total', value: formatCLP(totalMonto), cls: 'verde', icon: '💵' },
              { label: 'Recibido', value: formatCLP(totalRecibido), cls: 'verde', icon: '✅' },
              { label: 'Pendiente SGPI', value: sgpiPendientes > 0 ? `${sgpiPendientes} cuota${sgpiPendientes > 1 ? 's' : ''}` : 'Al día', cls: sgpiPendientes > 0 ? 'rojo' : 'verde', icon: sgpiPendientes > 0 ? '⚠️' : '✅' },
            ].map(kpi => (
              <div key={kpi.label} className={`kpi-card ${kpi.cls}`}
                   style={{ padding: 14 }}>
                <div className="kpi-header">
                  <span className="kpi-label" style={{ fontSize: 10 }}>{kpi.label}</span>
                  <span style={{ fontSize: 18 }}>{kpi.icon}</span>
                </div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Barra de progreso */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Avance financiero</span>
              <span style={{ fontWeight: 600 }}>
                {totalMonto > 0 ? Math.round((totalRecibido / totalMonto) * 100) : 0}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill verde"
                style={{ width: `${totalMonto > 0 ? (totalRecibido / totalMonto) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Tabla de cuotas */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              Cargando cuotas…
            </div>
          ) : cuotas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <div className="empty-title">Sin cuotas registradas</div>
              <div className="empty-text">Este proyecto aún no tiene cuotas cargadas en el sistema.</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cuota</th>
                    <th>Monto</th>
                    <th>F. Ingreso</th>
                    <th>F. Término Contrato</th>
                    <th>Monto Recibido</th>
                    <th>Ingresado SGPI</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((c, i) => (
                    <tr key={i}>
                      <td><strong>Cuota {c.cuota ?? i + 1}</strong></td>
                      <td className="td-monto">{formatCLP(c.monto)}</td>
                      <td>{formatDate(c.fecha_ingreso_cuotas)}</td>
                      <td style={{ color: (() => {
                        if (!c.fecha_termino_contrato) return 'inherit'
                        const days = (new Date(c.fecha_termino_contrato).getTime() - Date.now()) / 86400000
                        return days < 0 ? 'var(--rojo-alerta)' : days < 30 ? 'var(--amarillo-alerta)' : 'inherit'
                      })(), fontWeight: 600 }}>
                        {formatDate(c.fecha_termino_contrato)}
                      </td>
                      <td className="td-monto">{formatCLP(c.monto_recibido)}</td>
                      <td>
                        <span className={`badge ${c.ingresado_sgpi ? 'badge-verde' : 'badge-rojo'}`}>
                          {c.ingresado_sgpi ? '✓ Sí' : '✗ No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          (c.estado ?? '').toLowerCase().includes('pag') ? 'badge-verde' :
                          (c.estado ?? '').toLowerCase().includes('pend') ? 'badge-amarillo' :
                          'badge-gray'
                        }`}>
                          {c.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
