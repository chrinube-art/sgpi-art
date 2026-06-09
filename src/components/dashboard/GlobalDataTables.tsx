'use client'

import { useState, useMemo } from 'react'
import { type Project } from '@/lib/types'
import { formatCLP } from '@/lib/utils/format'

interface GlobalDataTablesProps {
  initialProjects: Project[]
}

export default function GlobalDataTables({ initialProjects }: GlobalDataTablesProps) {
  const [filterEstado, setFilterEstado] = useState<string>('En Ejecución')

  const uniqueEstados = useMemo(() => Array.from(new Set(initialProjects.map(p => p.estado_proyecto || 'Sin Información'))).filter(Boolean).sort(), [initialProjects])

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(p => {
      if (!filterEstado) return true
      return (p.estado_proyecto || 'Sin Información') === filterEstado
    })
  }, [initialProjects, filterEstado])

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

  const tableHeaderStyle = { background: '#003366', color: 'white', padding: '8px 12px', textAlign: 'left' as const, fontSize: '14px', border: '1px solid #ddd' }
  const tableCellStyle = { padding: '8px 12px', border: '1px solid #ddd', fontSize: '13px' }

  return (
    <div>
      {/* Slicer estilo Excel */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: '#003366', color: 'white', padding: '6px 16px', fontWeight: 'bold', border: '1px solid #003366' }}>Estado Proyecto</div>
        <select 
          style={{ padding: '6px', border: '1px solid #003366', width: '200px' }} 
          value={filterEstado} 
          onChange={e => setFilterEstado(e.target.value)}
        >
          <option value="">(Todos los Estados)</option>
          {uniqueEstados.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Tabla FF */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Fuente F.</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>$ Total FF</th>
              </tr>
            </thead>
            <tbody>
              {tablaFF.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{...tableCellStyle, fontWeight: 500, color: '#003366'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={tableCellStyle}>Total general</td>
                <td style={{...tableCellStyle, textAlign: 'center'}}>{TotalsFF.count}</td>
                <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(TotalsFF.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla IR */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>IR</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Total $</th>
              </tr>
            </thead>
            <tbody>
              {tablaIR.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{...tableCellStyle, fontWeight: 500, color: '#003366'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={tableCellStyle}>Total general</td>
                <td style={{...tableCellStyle, textAlign: 'center'}}>{TotalsIR.count}</td>
                <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(TotalsIR.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla Dependencia */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Dependencia</th>
                <th style={{...tableHeaderStyle, textAlign: 'center'}}>N° de Proyectos</th>
                <th style={{...tableHeaderStyle, textAlign: 'right'}}>$Total FF</th>
              </tr>
            </thead>
            <tbody>
              {tablaDep.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{...tableCellStyle, fontWeight: 500, color: '#003366'}}>{row.name}</td>
                  <td style={{...tableCellStyle, textAlign: 'center'}}>{row.count}</td>
                  <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(row.total)}</td>
                </tr>
              ))}
              <tr style={{ background: '#003366', color: 'white', fontWeight: 'bold' }}>
                <td style={tableCellStyle}>Total general</td>
                <td style={{...tableCellStyle, textAlign: 'center'}}>{TotalsDep.count}</td>
                <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCLP(TotalsDep.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
