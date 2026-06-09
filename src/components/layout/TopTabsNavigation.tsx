'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopTabsNavigation() {
  const pathname = usePathname()

  const tabs = [
    { href: '/dashboard', label: 'Inicio', icon: '🏠' },
    { href: '/proyectos', label: 'Proyectos (Dashboard)', icon: '📊' },
    { href: '/datos-globales', label: 'Datos Globales (KPIs)', icon: '📈' },
    { href: '/semaforos', label: 'Semáforos (Alertas)', icon: '🚦' },
    { href: '/cat', label: 'Carga Anual (CAT)', icon: '👥' },
    { href: '/cuotas', label: 'Cuotas e Informes', icon: '💰' },
    { href: '/importar', label: 'Importador', icon: '☁️' }
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      background: '#f8f9fa',
      padding: '8px 24px 0 24px',
      borderBottom: '2px solid #003366',
      overflowX: 'auto'
    }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link 
            key={tab.href} 
            href={tab.href}
            style={{
              padding: '10px 20px',
              background: isActive ? '#003366' : '#e9ecef',
              color: isActive ? 'white' : '#495057',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              textDecoration: 'none',
              fontWeight: isActive ? 'bold' : 'normal',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #dee2e6',
              borderBottom: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
