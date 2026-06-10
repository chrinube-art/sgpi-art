'use client'

import { useState, useMemo } from 'react'
import { type Project } from '@/lib/types'
import ProjectGrid from '@/components/grid/ProjectGrid'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, LabelList
} from 'recharts'
import { formatCLP } from '@/lib/utils/format'

const COLORS = ['#007a33', '#1e8f49', '#3ba45e', '#59ba74', '#78d08b', '#005c26', '#00401a', '#2c5e3d', '#4d9466', '#a1e0b5']

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

  const formatShortMoney = (val: any) => {
    const num = Number(val)
    if (isNaN(num)) return val
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`
    return `$${num}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Slicers (Filtros) */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>Filtro Rápido: Estado Proyecto</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button 
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #007a33', background: filterEstado === '' ? '#007a33' : 'white', color: filterEstado === '' ? 'white' : '#007a33', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setFilterEstado('')}
          >
            Todos
          </button>
          {uniqueEstados.map(e => (
            <button 
              key={e}
              style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #007a33', background: filterEstado === e ? '#007a33' : 'white', color: filterEstado === e ? 'white' : '#007a33', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setFilterEstado(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Más Filtros</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

          <select className="form-input" value={filterFF} onChange={e => setFilterFF(e.target.value)}>
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>Todas las Fuentes (F.F)</option>
            {uniqueFF.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
          </select>

          <select className="form-input" value={filterIR} onChange={e => setFilterIR(e.target.value)}>
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>Todos los Investigadores (IR)</option>
            {uniqueIRs.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
          </select>

          <select className="form-input" value={filterDependencia} onChange={e => setFilterDependencia(e.target.value)}>
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>Todas las Dependencias</option>
            {uniqueDeps.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
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
        <div className="card" style={{ height: 380, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, color: '#007a33', fontWeight: 'bold' }}>Proyectos por Dependencia</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <Pie data={depData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name, value}: any) => `${String(name).split('-')[1] || name} (${value})`} labelLine={true} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                {depData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Proyectos por IR */}
        <div className="card" style={{ height: 380, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, color: '#007a33', fontWeight: 'bold' }}>Proyectos por IR</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={irData} margin={{ top: 20, right: 5, left: 0, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 11, fill: '#475569'}} />
              <YAxis tick={{fontSize: 12, fill: '#475569'}} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#007a33" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#007a33', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* $ Pecunio por IR */}
        <div className="card" style={{ height: 380, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, color: '#007a33', fontWeight: 'bold' }}>$ Pecunio Capturado por IR</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pecunioIrData} margin={{ top: 20, right: 5, left: 10, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 11, fill: '#475569'}} />
              <YAxis tickFormatter={formatShortMoney} tick={{fontSize: 12, fill: '#475569'}} />
              <RechartsTooltip formatter={(v: any) => formatCLP(Number(v) || 0)} />
              <Bar dataKey="value" fill="#3ba45e" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="value" position="top" formatter={formatShortMoney} style={{ fontSize: 10, fill: '#3ba45e', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* $ Capturado por F.F */}
        <div className="card" style={{ height: 380, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, color: '#007a33', fontWeight: 'bold' }}>$ Capturado por F.F</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moneyFfData} margin={{ top: 20, right: 5, left: 10, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 11, fill: '#475569'}} />
              <YAxis tickFormatter={formatShortMoney} tick={{fontSize: 12, fill: '#475569'}} />
              <RechartsTooltip formatter={(v: any) => formatCLP(Number(v) || 0)} />
              <Line type="monotone" dataKey="value" stroke="#007a33" strokeWidth={3} dot={{r: 4, fill: '#007a33'}}>
                <LabelList dataKey="value" position="top" formatter={formatShortMoney} style={{ fontSize: 10, fill: '#007a33', fontWeight: 'bold' }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Proyectos por F.F */}
        <div className="card" style={{ height: 380, padding: 10 }}>
          <h4 style={{ textAlign: 'center', fontSize: 14, marginBottom: 15, color: '#007a33', fontWeight: 'bold' }}>Proyectos por F.F</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ffCounts} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{fontSize: 12, fill: '#475569'}} />
              <YAxis type="category" dataKey="name" tick={{fontSize: 11, fill: '#475569'}} width={120} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#007a33" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#007a33', fontWeight: 'bold' }} />
              </Bar>
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
