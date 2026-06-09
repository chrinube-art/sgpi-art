'use client'

import { useState, useMemo } from 'react'
import { type Project } from '@/lib/types'
import { formatCLP } from '@/lib/utils/format'

interface GlobalDataTablesProps {
  initialProjects: Project[]
}

export default function GlobalDataTables({ initialProjects }: GlobalDataTablesProps) {
  const [filterEstado, setFilterEstado] = useState<string>('En Ejecución')
  const [filterDependencia, setFilterDependencia] = useState<string>('')
  const [filterConcurso, setFilterConcurso] = useState<string>('')

  const uniqueEstados = useMemo(() => Array.from(new Set(initialProjects.map(p => p.estado_proyecto || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])
  const uniqueDependencias = useMemo(() => Array.from(new Set(initialProjects.map(p => p.dependencia || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])
  const uniqueConcursos = useMemo(() => Array.from(new Set(initialProjects.map(p => p.nombre_ff || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(p => {
      const matchEstado = filterEstado ? (p.estado_proyecto || 'Sin Información') === filterEstado : true
      const matchDep = filterDependencia ? (p.dependencia || 'Sin Información') === filterDependencia : true
      const matchConc = filterConcurso ? (p.nombre_ff || 'Sin Información') === filterConcurso : true
      return matchEstado && matchDep && matchConc
    })
  }, [initialProjects, filterEstado, filterDependencia, filterConcurso])

  // 1. Fuente Financiamiento
  const tablaFF = useMemo(() => {
    const map = new Map<string, { count: number, total: number }>()
    filteredProjects.forEach(p => {
      const ff = p.nombre_ff || 'Sin Información'
      const current = map.get(ff) || { count: 0, total: 0 }
      map.set(ff, { count: current.count + 1, total: current.total + (p.monto_ff || 0) })
    })
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => a.name.localeCompare(b.name))
  }, [filteredProjects])

  // 2. IR (Investigador Responsable)
  const tablaIR = useMemo(() => {
    const map = new Map<string, { count: number, total: number }>()
    filteredProjects.forEach(p => {
      const ir = p.jefe_proyecto || 'Sin Información'
      const current = map.get(ir) || { count: 0, total: 0 }
      map.set(ir, { count: current.count + 1, total: current.total + (p.total_proyecto || 0) })
    })
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => a.name.localeCompare(b.name))
  }, [filteredProjects])

  // 3. Dependencia
  const tablaDep = useMemo(() => {
    const map = new Map<string, { count: number, total: number }>()
    filteredProjects.forEach(p => {
      const dep = p.dependencia || 'Sin Información'
      const current = map.get(dep) || { count: 0, total: 0 }
      map.set(dep, { count: current.count + 1, total: current.total + (p.monto_ff || 0) })
    })
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => a.name.localeCompare(b.name))
  }, [filteredProjects])

  const TotalsFF = tablaFF.reduce((acc, row) => ({ count: acc.count + row.count, total: acc.total + row.total }), { count: 0, total: 0 })
  const TotalsIR = tablaIR.reduce((acc, row) => ({ count: acc.count + row.count, total: acc.total + row.total }), { count: 0, total: 0 })
  const TotalsDep = tablaDep.reduce((acc, row) => ({ count: acc.count + row.count, total: acc.total + row.total }), { count: 0, total: 0 })

  const tableHeaderStyle = { background: '#003366', color: '#ffffff', padding: '12px 16px', textAlign: 'left' as const, fontSize: '13px', borderBottom: '2px solid #002244', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
  const tableCellStyle = { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b' }

  return (
    <div>
      {/* Slicers estilo Excel */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#003366', color: 'white', padding: '6px 16px', fontWeight: 'bold', border: '1px solid #003366', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>Estado Proyecto</div>
          <select 
            style={{ padding: '6px', border: '1px solid #003366', width: '200px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', background: '#fff', color: '#0f172a' }} 
            value={filterEstado} 
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>(Todos los Estados)</option>
            {uniqueEstados.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#003366', color: 'white', padding: '6px 16px', fontWeight: 'bold', border: '1px solid #003366', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>Dependencia</div>
          <select 
            style={{ padding: '6px', border: '1px solid #003366', width: '200px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', background: '#fff', color: '#0f172a' }} 
            value={filterDependencia} 
            onChange={e => setFilterDependencia(e.target.value)}
          >
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>(Todas las Dependencias)</option>
            {uniqueDependencias.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#003366', color: 'white', padding: '6px 16px', fontWeight: 'bold', border: '1px solid #003366', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>Concursos (F.F)</div>
          <select 
            style={{ padding: '6px', border: '1px solid #003366', width: '200px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', background: '#fff', color: '#0f172a' }} 
            value={filterConcurso} 
            onChange={e => setFilterConcurso(e.target.value)}
          >
            <option value="" style={{ color: '#0f172a', background: '#ffffff' }}>(Todos los Concursos)</option>
            {uniqueConcursos.map(e => <option key={e} value={e} style={{ color: '#0f172a', background: '#ffffff' }}>{e}</option>)}
          </select>
        </div>

        {(filterEstado || filterDependencia || filterConcurso) && (
          <button 
            className="btn btn-secondary" 
            onClick={() => { setFilterEstado(''); setFilterDependencia(''); setFilterConcurso(''); }}
            style={{ padding: '6px 16px', marginLeft: 'auto' }}
          >
            Limpiar Filtros
          </button>
        )}

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Tabla FF */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Fuente F.</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>$ Total FF</th>
              </tr>
            </thead>
            <tbody>
              {tablaFF.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#f8fafc' : '#ffffff'}>
                  <td style={{...tableCellStyle, fontWeight: 600, color: '#0f172a'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center', color: '#475569'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right', color: '#0f172a', fontWeight: 500}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ffffff' }}>Total general</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#ffffff' }}>{TotalsFF.count}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#ffffff' }}>{formatCLP(TotalsFF.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla IR */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Investigador Responsable (IR)</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Total $</th>
              </tr>
            </thead>
            <tbody>
              {tablaIR.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#f8fafc' : '#ffffff'}>
                  <td style={{...tableCellStyle, fontWeight: 600, color: '#0f172a'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center', color: '#475569'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right', color: '#0f172a', fontWeight: 500}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ffffff' }}>Total general</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#ffffff' }}>{TotalsIR.count}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#ffffff' }}>{formatCLP(TotalsIR.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla Dependencia */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Dependencia</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>$ Total FF</th>
              </tr>
            </thead>
            <tbody>
              {tablaDep.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#f8fafc' : '#ffffff'}>
                  <td style={{...tableCellStyle, fontWeight: 600, color: '#0f172a'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center', color: '#475569'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right', color: '#0f172a', fontWeight: 500}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ffffff' }}>Total general</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#ffffff' }}>{TotalsDep.count}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#ffffff' }}>{formatCLP(TotalsDep.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
