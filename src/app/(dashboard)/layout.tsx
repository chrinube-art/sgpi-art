'use client'
import Sidebar from '@/components/layout/Sidebar'
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
    <div className="app-layout">
      <Sidebar 
        userRole={userRole}
        userName={userName}
        zona={zona}
        alertasRojas={5}
      />
      <main className="main-content">
        <Header 
          title="SGPI INIA"
          subtitle="Sistema de Gestión de Proyectos e Histórico Integrado"
        />
        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
           <button className="btn btn-sm" onClick={() => signOut()} style={{ color: 'var(--text-muted)' }}>Cerrar sesión</button>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
