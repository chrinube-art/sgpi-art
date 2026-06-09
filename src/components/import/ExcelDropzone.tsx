'use client'
// components/import/ExcelDropzone.tsx
import { useState, useCallback, useRef } from 'react'
import { type ImportResult } from '@/lib/types'

interface ExcelDropzoneProps {
  onImport: (results: ImportResult[], data: unknown) => void
  centro: string
}

export default function ExcelDropzone({ onImport, centro }: ExcelDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo se aceptan archivos Excel (.xlsx o .xls)')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setFileName(file.name)

    try {
      const buffer = await file.arrayBuffer()
      const { processWorkbook } = await import('@/lib/excel/parser')
      const parsed = processWorkbook(buffer)

      const allResults = parsed.results
      setResults(allResults)
      onImport(allResults, parsed)
    } catch (e) {
      setError(`Error al procesar el archivo: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }, [onImport])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const hasErrors = results?.some(r => !r.success)
  const allOk     = results && !hasErrors

  return (
    <div>
      {/* Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        id="excel-dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />

        {loading ? (
          <>
            <div className="dropzone-icon">⏳</div>
            <div className="dropzone-text">Procesando {fileName}…</div>
            <div style={{ marginTop: 16 }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          </>
        ) : (
          <>
            <div className="dropzone-icon">📤</div>
            <div className="dropzone-text">
              Arrastre el archivo Excel aquí o haga clic para seleccionar
            </div>
            <div className="dropzone-hint">
              Archivos soportados: <strong>.xlsx, .xls</strong> — Centro: <strong>{centro || 'Todos'}</strong>
            </div>
            <div className="dropzone-hint" style={{ marginTop: 8 }}>
              Pestañas requeridas: <strong>BBDD</strong>, <strong>CAT</strong>, <strong>Cuotas</strong>
            </div>
          </>
        )}
      </div>

      {/* Error genérico */}
      {error && (
        <div className="alert alert-rojo" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Resultados de validación */}
      {results && results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Resultado de validación: <strong>{fileName}</strong>
            </span>
            {allOk
              ? <span className="badge badge-verde">✓ Listo para importar</span>
              : <span className="badge badge-rojo">⚠ Errores detectados</span>
            }
          </div>

          {results.map((r, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div className={`alert ${r.success ? 'alert-verde' : 'alert-rojo'}`}>
                <div>
                  <strong>
                    {r.sheetType === 'bbdd'   ? '📋 Pestaña BBDD' :
                     r.sheetType === 'cat'    ? '👥 Pestaña CAT' :
                     r.sheetType === 'cuotas' ? '💰 Pestaña Cuotas' : r.sheetType}
                  </strong>
                  {r.success
                    ? <> — ✓ {r.rowsImported} filas válidas</>
                    : <> — {r.errors.length} error{r.errors.length > 1 ? 'es' : ''} encontrado{r.errors.length > 1 ? 's' : ''}</>
                  }
                </div>
                {r.errors.length > 0 && (
                  <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 12 }}>
                    {r.errors.map((e, j) => (
                      <li key={j} style={{ marginBottom: 4 }}>
                        {e.type === 'missing_column'
                          ? <>❌ Columna faltante: <code style={{ background:'rgba(0,0,0,0.08)', padding:'1px 5px', borderRadius:3 }}>{e.column}</code></>
                          : <>⚠ {e.message}</>
                        }
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {allOk && (
            <button
              className="btn btn-verde"
              style={{ marginTop: 8 }}
              id="confirm-import-btn"
              onClick={() => alert('Importación a base de datos — conecte Supabase para activar')}
            >
              ✅ Confirmar Importación a Base de Datos
            </button>
          )}
        </div>
      )}
    </div>
  )
}
