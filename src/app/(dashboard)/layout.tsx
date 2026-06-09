'use client'
import TopTabsNavigation from '@/components/layout/TopTabsNavigation'
import Header from '@/components/layout/Header'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="spinner" style={{ margin: '100px auto' }} />
  }

  if (status === 'unauthenticated') {
    redirect('/login')
  }

  const userRole = (session?.user as any)?.role || 'investigador'
  const userName = session?.user?.name || session?.user?.email || 'Usuario'
  const zona = (session?.user as any)?.centro || 'Consolidado'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f0f2f5' }}>
      <Header 
        title="SGPI INIA"
        subtitle="Sistema de Gestión de Proyectos e Histórico Integrado"
      />
      <TopTabsNavigation />
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={() => signOut()} style={{ color: 'var(--text-muted)' }}>Cerrar sesión</button>
        </div>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: 'calc(100vh - 200px)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
