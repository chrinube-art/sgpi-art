'use client'
// components/layout/Sidebar.tsx
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: number
  section?: string
}

interface SidebarProps {
  userRole?: string
  userName?: string
  zona?: string
  alertasRojas?: number
}

const NAV_ITEMS: NavItem[] = [
  { section: 'Principal', href: '/dashboard', icon: '⬡', label: 'Panel General' },
  { href: '/proyectos', icon: '📋', label: 'Portafolio de Proyectos' },
  { href: '/datos-globales', icon: '📊', label: 'Datos Globales' },
  { href: '/semaforos', icon: '🚦', label: 'Monitor de Alertas' },
  { section: 'Módulos', href: '/cuotas', icon: '💰', label: 'Cuotas e Informes' },
  { href: '/cat', icon: '👥', label: 'Carga Anual (CAT)' },
  { section: 'Administración', href: '/importar', icon: '📤', label: 'Importar Planillas' },
  { href: '/snapshots', icon: '🔒', label: 'Snapshots Históricos' },
  { href: '/usuarios', icon: '⚙️', label: 'Usuarios y Roles' },
]

function getRoleLabel(role?: string): string {
  const map: Record<string, string> = {
    admin:               'Administrador General',
    director_ohiggins:   "Director O'Higgins",
    director_maule:      'Director Maule',
    investigador_ohiggins: "Investigador O'Higgins",
    investigador_maule:  'Investigador Maule',
  }
  return role ? (map[role] ?? role) : 'Usuario'
}

function getZonaBadge(role?: string): string | null {
  if (!role || role === 'admin') return null
  if (role.includes('ohiggins')) return "📍 Zona O'Higgins"
  if (role.includes('maule'))    return '📍 Zona Maule'
  return null
}

function filterNavByRole(items: NavItem[], role?: string): NavItem[] {
  if (!role || role === 'admin') return items
  // Roles regionales no ven Usuarios y Roles ni configuración global
  return items.filter(i => i.href !== '/usuarios')
}

export default function Sidebar({ userRole, userName, zona, alertasRojas = 0 }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const zonaBadge = getZonaBadge(userRole)
  const navItems  = filterNavByRole(NAV_ITEMS, userRole)

  let lastSection = ''

  return (
    <aside className="sidebar" style={{ width: collapsed ? '64px' : undefined }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: collapsed ? '12px' : undefined }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src="/logo-inia.png"
              alt="INIA — Ministerio de Agricultura"
              style={{ maxHeight: 48, objectFit: 'contain', flex: 1 }}
              onError={(e) => {
                // Fallback: mostrar texto si no hay imagen
                const t = e.currentTarget.parentElement!
                e.currentTarget.style.display = 'none'
                const div = document.createElement('div')
                div.innerHTML = `<span style="color:white;font-weight:800;font-size:18px;letter-spacing:-0.5px">INIA</span><br/><span style="color:rgba(255,255,255,0.6);font-size:10px">Minist. Agricultura</span>`
                t.prepend(div)
              }}
            />
            <button
              onClick={() => setCollapsed(true)}
              style={{ background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:16,padding:'4px',flexShrink:0 }}
              title="Colapsar menú"
            >‹</button>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            style={{ background:'none',border:'none',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:20,width:'100%',textAlign:'center' }}
            title="Expandir menú"
          >☰</button>
        )}
      </div>

      {/* Zona Badge */}
      {!collapsed && zonaBadge && (
        <div className="sidebar-zone-badge">
          {zonaBadge}
        </div>
      )}
      {!collapsed && !zonaBadge && (
        <div className="sidebar-zone-badge" style={{ background:'linear-gradient(135deg,#003366,#0050A0)' }}>
          🌐 Acceso Nacional
        </div>
      )}

      {/* Navegación */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          const badge = item.href === '/semaforos' ? alertasRojas : item.badge

          return (
            <React.Fragment key={item.href}>
              {showSection && (
                <div className="sidebar-section-label">{item.section}</div>
              )}
              <Link href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {badge && badge > 0 && (
                      <span className="nav-badge">{badge}</span>
                    )}
                  </>
                )}
              </Link>
            </React.Fragment>
          )
        })}
      </nav>

      {/* Footer de usuario */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {(userName ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{userName ?? 'Administrador'}</div>
              <div className="user-role">{getRoleLabel(userRole)}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
