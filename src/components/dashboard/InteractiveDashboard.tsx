'use client'

import { useState, useMemo } from 'react'
import { type Project } from '@/lib/types'
import ProjectGrid from '@/components/grid/ProjectGrid'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { formatCLP } from '@/lib/utils/format'

const COLORS = ['#003366', '#4CAF50', '#FFC107', '#F44336', '#9E9E9E', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63']

interface InteractiveDashboardProps {
  initialProjects: Project[]
}

export default function InteractiveDashboard({ initialProjects }: InteractiveDashboardProps) {
  const [filterFF, setFilterFF] = useState<string>('')
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [filterIR, setFilterIR] = useState<string>('')
  const [filterDependencia, setFilterDependencia] = useState<string>('')

  // Unique lists for slicers
  const uniqueFF = useMemo(() => Array.from(new Set(initialProjects.map(p => p.nombre_ff || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])
  const uniqueEstados = useMemo(() => Array.from(new Set(initialProjects.map(p => p.estado_proyecto || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])
  const uniqueIRs = useMemo(() => Array.from(new Set(initialProjects.map(p => p.jefe_proyecto || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])
  const uniqueDeps = useMemo(() => Array.from(new Set(initialProjects.map(p => p.dependencia || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    return initialProjects.filter(p => {
      const matchFF = filterFF ? (p.nombre_ff || 'Sin Información') === filterFF : true
      const matchEstado = filterEstado ? (p.estado_proyecto || 'Sin Información') === filterEstado : true
      const matchIR = filterIR ? (p.jefe_proyecto || 'Sin Información') === filterIR : true
      const matchDep = filterDependencia ? (p.dependencia || 'Sin Información') === filterDependencia : true
      return matchFF && matchEstado && matchIR && matchDep
    })
  }, [initialProjects, filterFF, filterEstado, filterIR, filterDependencia])

  // Data aggregations for charts
  
  // 1. Proyectos por Dependencia (Donut)
  const depData = useMemo(() => {
    const counts = filteredProjects.reduce((acc, p) => {
      const dep = p.dependencia || 'Sin Información'
      acc[dep] = (acc[dep] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  }, [filteredProjects])

  // 2. Proyectos por IR (Bar)
  const irData = useMemo(() => {
    const counts = filteredProjects.reduce((acc, p) => {
      let ir = p.jefe_proyecto || 'Sin Información'
      // acortar nombres largos para el grafico
      if (ir.includes(',')) ir = ir.split(',')[0]
      acc[ir] = (acc[ir] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 15)
  }, [filteredProjects])

  // 3. $ Pecunio por IR (Bar)
  const pecunioIrData = useMemo(() => {
    const sums = filteredProjects.reduce((acc, p) => {
      let ir = p.jefe_proyecto || 'Sin Información'
      if (ir.includes(',')) ir = ir.split(',')[0]
      acc[ir] = (acc[ir] || 0) + (p.pecunio_inia || 0)
      return acc
    }, {} as Record<string, number>)
    return Object.entries(sums).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 15)
  }, [filteredProjects])

  // 4. $ Capturado por F.F (Line)
  const moneyFfData = useMemo(() => {
    const sums = filteredProjects.reduce((acc, p) => {
      const ff = p.nombre_ff || 'Sin Información'
      acc[ff] = (acc[ff] || 0) + (p.monto_ff || 0)
      return acc
    }, {} as Record<string, number>)
    return Object.entries(sums).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  }, [filteredProjects])

  // 5. Proyectos por F.F (Barra horizontal)
  const ffCounts = useMemo(() => {
    const counts = filteredProjects.reduce((acc, p) => {
      const ff = p.nombre_ff || 'Sin Información'
      acc[ff] = (acc[ff] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  }, [filteredProjects])

  const formatShortMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
    return `$${val}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Slicers (Filtros) */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Segmentadores / Filtros de Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <select className="form-input" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
            <option value="">Todos los Estados</option>
            {uniqueEstados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select className="form-input" value={filterFF} onChange={e => setFilterFF(e.target.value)}>
            <option value="">Todas las Fuentes (F.F)</option>
            {uniqueFF.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select className="form-input" value={filterIR} onChange={e => setFilterIR(e.target.value)}>
            <option value="">Todos los Investigadores (IR)</option>
            {uniqueIRs.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select className="form-input" value={filterDependencia} onChange={e => setFilterDependencia(e.target.value)}>
            <option value="">Todas las Dependencias</option>
            {uniqueDeps.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          {(filterEstado || filterFF || filterIR || filterDependencia) && (
            <button className="btn btn-secondary" onClick={() => {
              setFilterEstado(''); setFilterFF(''); setFilterIR(''); setFilterDependencia('');
            }}>Limpiar Filtros</button>
          )}
        </div>
      </div>

      <div style={{ padding: '8px', background: '#003366', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
        DASHBOARD INTERACTIVO DE PROYECTOS ({filteredProjects.length} Registros)
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        {/* Dependencia */}
        <div className="card" style={{ height: 320, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 13, marginBottom: 10 }}>Proyectos por Dependencia</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={depData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name, value}) => `${value}`}>
                {depData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Proyectos por IR */}
        <div className="card" style={{ height: 320, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 13, marginBottom: 10 }}>Proyectos por IR</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={irData} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 9}} />
              <YAxis tick={{fontSize: 10}} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* $ Pecunio por IR */}
        <div className="card" style={{ height: 320, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 13, marginBottom: 10 }}>$ Pecunio Capturado por IR</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pecunioIrData} margin={{ top: 5, right: 5, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 9}} />
              <YAxis tickFormatter={formatShortMoney} tick={{fontSize: 10}} />
              <RechartsTooltip formatter={(v: any) => formatCLP(Number(v) || 0)} />
              <Bar dataKey="value" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* $ Capturado por F.F */}
        <div className="card" style={{ height: 320, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 13, marginBottom: 10 }}>$ Capturado por F.F</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moneyFfData} margin={{ top: 5, right: 5, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 9}} />
              <YAxis tickFormatter={formatShortMoney} tick={{fontSize: 10}} />
              <RechartsTooltip formatter={(v: any) => formatCLP(Number(v) || 0)} />
              <Line type="monotone" dataKey="value" stroke="#003366" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Proyectos por F.F */}
        <div className="card" style={{ height: 320, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 13, marginBottom: 10 }}>Proyectos por F.F</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ffCounts} layout="vertical" margin={{ top: 5, right: 5, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{fontSize: 10}} />
              <YAxis type="category" dataKey="name" tick={{fontSize: 9}} width={80} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Grilla Filtrada */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Detalle de Proyectos</h3>
        <ProjectGrid data={filteredProjects} isAdmin={true} />
      </div>

    </div>
  )
}
