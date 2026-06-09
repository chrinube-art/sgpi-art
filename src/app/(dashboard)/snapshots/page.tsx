'use client'

export default function SnapshotsPage() {
  const handleCerrarMes = async () => {
    const res = await fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodo: '2026-05' })
    })
    const data = await res.json()
    alert(data.message || data.error)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🔒 Snapshots Históricos</h2>
        <div className="card-subtitle">Congelamiento de datos mensuales para inmutabilidad del periodo.</div>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 24 }}>
          <button className="btn btn-rojo" onClick={handleCerrarMes}>
            🔒 Cerrar y Congelar Mes (Ejemplo: Mayo 2026)
          </button>
        </div>

        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-icon">📅</div>
          <div className="empty-title">Sin periodos congelados</div>
          <div className="empty-text">Aún no se ha realizado el cierre de ningún periodo.</div>
        </div>
      </div>
    </div>
  )
}
