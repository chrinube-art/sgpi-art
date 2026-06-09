'use client'

import { useState, useEffect } from 'react'
import CATHeatmap from '@/components/cat/CATHeatmap'
import { type CatEntry } from '@/lib/types'

// Mock data
const MOCK_CAT: CatEntry[] = [
  {
    codigo_proyecto: '503043-70',
    anio: 2024,
    empleado: 'Juan Pérez',
    rut: '12.345.678-9',
    ene: 20, feb: 20, mar: 50, abr: 50, may: 50, jun: 50, jul: 50, ago: 50, sep: 50, oct: 50, nov: 50, dic: 20
  },
  {
    codigo_proyecto: '503044-70',
    anio: 2024,
    empleado: 'Juan Pérez',
    rut: '12.345.678-9',
    ene: 0, feb: 0, mar: 60, abr: 60, may: 60, jun: 60, jul: 60, ago: 60, sep: 60, oct: 60, nov: 60, dic: 0
  },
  {
    codigo_proyecto: '503043-70',
    anio: 2024,
    empleado: 'María González',
    rut: '98.765.432-1',
    ene: 100, feb: 100, mar: 100, abr: 100, may: 100, jun: 100, jul: 100, ago: 100, sep: 100, oct: 100, nov: 100, dic: 100
  }
]

export default function CATPage() {
  const [entries, setEntries] = useState<CatEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setEntries(MOCK_CAT)
      setLoading(false)
    }, 500)
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
      <CATHeatmap entries={entries} anio={new Date().getFullYear()} />
    </div>
  )
}
