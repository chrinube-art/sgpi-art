'use client'

import { type Project } from '@/lib/types'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DashboardChartsProps {
  projects: Project[]
}

const COLORS = ['#003366', '#4CAF50', '#FFC107', '#F44336', '#9E9E9E', '#2196F3', '#FF9800']

export default function DashboardCharts({ projects }: DashboardChartsProps) {
  // 1. Proyectos por Estado (Donut)
  const statusCounts = projects.reduce((acc, p) => {
    const status = p.estado_proyecto || 'Sin Estado'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // 2. Presupuesto por Fuente de Financiamiento (Pie)
  const ffCounts = projects.reduce((acc, p) => {
    const ff = p.nombre_ff || 'Otro'
    acc[ff] = (acc[ff] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const ffData = Object.entries(ffCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)

  // 3. Monto por Centro (BarChart)
  const montoPorCentro = projects.reduce((acc, p) => {
    const centro = p.centro_propietario || 'Desconocido'
    acc[centro] = (acc[centro] || 0) + (p.total_proyecto || 0)
    return acc
  }, {} as Record<string, number>)

  const centroData = Object.entries(montoPorCentro).map(([name, value]) => ({
    name: name.toUpperCase(),
    Monto: Math.round(value / 1000000) // Mostrar en millones
  }))

  const formatCLP = (val: number) => `$${val} M`

  if (projects.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      
      {/* Gráfico de Estados */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: 16 }}>Estado del Portafolio</h3>
        </div>
        <div className="card-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Fuentes de financiamiento */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: 16 }}>Top 5 Fuentes de Financiamiento</h3>
        </div>
        <div className="card-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ffData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                labelLine={false}
              >
                {ffData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Montos por Centro */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: 16 }}>Presupuesto por Centro (Millones CLP)</h3>
        </div>
        <div className="card-body" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centroData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCLP} />
              <RechartsTooltip formatter={(val) => [`$${val} Millones`, 'Presupuesto']} />
              <Bar dataKey="Monto" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
