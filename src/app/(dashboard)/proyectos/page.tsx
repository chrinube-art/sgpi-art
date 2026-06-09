'use client'

import { useState, useEffect } from 'react'
import ProjectGrid from '@/components/grid/ProjectGrid'
import { type Project } from '@/lib/types'

// Mock data
const MOCK_PROJECTS: Project[] = [
  {
    codigo_proyecto: '503043-70',
    titulo_proyecto: 'Desarrollo de nuevas variedades de trigo',
    jefe_proyecto: 'Juan Pérez',
    estado_proyecto: 'En Ejecución',
    ff: 'FIA',
    dependencia: 'Ministerio de Agricultura',
    desde: '2023-01-01',
    hasta: '2025-12-31',
    total_proyecto: 150000000,
    macrozona: 'ohiggins',
    centro_propietario: 'rayentue',
    fecha_termino_contrato: '2025-12-31'
  },
  {
    codigo_proyecto: '503044-70',
    titulo_proyecto: 'Estudio de adaptabilidad de frutales',
    jefe_proyecto: 'María González',
    estado_proyecto: 'En Negociación',
    ff: 'FONDECYT',
    dependencia: 'ANID',
    desde: '2024-05-01',
    hasta: '2026-05-01',
    total_proyecto: 80000000,
    macrozona: 'maule',
    centro_propietario: 'raihuen',
    fecha_termino_contrato: '2024-06-30' // Vencido pronto para testear semáforo
  }
]

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aquí iría la carga real desde Supabase
    // setTimeout simulates network request
    const loadProjects = async () => {
      setProjects(MOCK_PROJECTS)
      setLoading(false)
    }
    loadProjects()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner" />
      </div>
    )
  }

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

        <div className="kpi-card rojo" style={{ flex: 1 }}>
          <div className="kpi-header">
            <span className="kpi-label">Alertas Críticas</span>
            <span className="kpi-icon rojo">🚨</span>
          </div>
          <div className="kpi-value">
            {/* El cálculo real vendría del backend o del engine de semáforos */}
            1
          </div>
        </div>
      </div>

      <ProjectGrid data={projects} isAdmin={true} />
    </div>
  )
}
