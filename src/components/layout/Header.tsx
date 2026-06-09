'use client'
// components/layout/Header.tsx
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  onSearch?: (query: string) => void
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, onSearch, actions }: HeaderProps) {
  const [dark, setDark] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Toggle dark mode
  useEffect(() => {
    const saved = localStorage.getItem('sgpi-theme')
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setDark(true)
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('sgpi-theme', next ? 'dark' : 'light')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value)
    onSearch?.(e.target.value)
  }

  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="header">
      {/* Título */}
      <div style={{ flex: 1 }}>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-subtitle">{subtitle}</div>}
      </div>

      {/* Barra de búsqueda */}
      {onSearch !== undefined && (
        <div className="search-bar">
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por código, nombre, jefe…"
            value={searchVal}
            onChange={handleSearch}
            id="global-search"
          />
          {searchVal && (
            <button
              onClick={() => { setSearchVal(''); onSearch?.('') }}
              style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:14,padding:0 }}
            >✕</button>
          )}
        </div>
      )}

      {/* Acciones extras */}
      {actions}

      {/* Fecha */}
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'none' }}
           className="header-date">
        {today}
      </div>

      {/* Toggle Dark Mode */}
      <button
        className="icon-btn"
        onClick={toggleDark}
        title={dark ? 'Modo claro' : 'Modo oscuro'}
        id="toggle-theme-btn"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Notificaciones */}
      <button className="icon-btn" title="Notificaciones" id="notifications-btn">
        🔔
      </button>

      {/* Logout */}
      <button
        className="icon-btn"
        title="Cerrar sesión"
        id="logout-btn"
        onClick={async () => {
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
          } catch {}
          router.push('/login')
        }}
      >
        🚪
      </button>
    </header>
  )
}
