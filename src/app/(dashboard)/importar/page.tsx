'use client'

import { useState } from 'react'
import ExcelDropzone from '@/components/import/ExcelDropzone'
import { type ImportResult } from '@/lib/types'

export default function ImportarPage() {
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null)

  const handleImport = (results: ImportResult[], data: any) => {
    setImportResults(results)
    console.log("Parsed data:", data)
    // Aquí se enviaría la data a Supabase
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Importar Planillas Excel</h2>
            <div className="card-subtitle">
              Sube las planillas mensuales para actualizar la base de datos central.
            </div>
          </div>
        </div>
        <div className="card-body">
          <ExcelDropzone 
            centro="" 
            onImport={handleImport} 
          />
        </div>
      </div>
    </div>
  )
}
