import ProjectGrid from '@/components/grid/ProjectGrid'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { turso } from '@/lib/db/turso'
import { type Project } from '@/lib/types'

export default async function ProyectosPage() {
  // Cargar proyectos reales desde Turso
  const result = await turso.execute('SELECT * FROM projects ORDER BY created_at DESC')
  
  const projects: Project[] = result.rows.map(r => ({
    codigo_proyecto: r.codigo_proyecto as string,
    nombre_ff: r.nombre_ff as string,
    ff: r.ff as string,
    estado_codigo: r.estado_codigo as string,
    estado_formulario: r.estado_formulario as string,
    estado_acta_inicio: r.estado_acta_inicio as string,
    estado_contrato: r.estado_contrato as string,
    titulo_proyecto: r.titulo_proyecto as string,
    jefe_proyecto: r.jefe_proyecto as string,
    estado_proyecto: r.estado_proyecto as string,
    dependencia: r.dependencia as string,
    desde: r.desde as string,
    hasta: r.hasta as string,
    monto_ff: r.monto_ff as number,
    pecunio_asociado: r.pecunio_asociado as number,
    no_pecunio_asociado: r.no_pecunio_asociado as number,
    pecunio_inia: r.pecunio_inia as number,
    no_pecunio_inia: r.no_pecunio_inia as number,
    total_proyecto: r.total_proyecto as number,
    codigo_externo: r.codigo_externo as string,
    macrozona: r.macrozona as 'ohiggins' | 'maule',
    centro_propietario: r.centro_propietario as any
  }))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <div className="kpi-card azul" style={{ flex: 1 }}>
          <div className="kpi-header">
            <span className="kpi-label">Total Proyectos</span>
            <span className="kpi-icon azul">📋</span>
          </div>
          <div className="kpi-value">{projects.length}</div>
        </div>
        
        <div className="kpi-card verde" style={{ flex: 1 }}>
          <div className="kpi-header">
            <span className="kpi-label">En Ejecución</span>
            <span className="kpi-icon verde">▶️</span>
          </div>
          <div className="kpi-value">
            {projects.filter(p => p.estado_proyecto?.toLowerCase().includes('ejecuci')).length}
          </div>
        </div>
      </div>

      <DashboardCharts projects={projects} />

      <ProjectGrid data={projects} isAdmin={true} />
    </div>
  )
}
