'use client'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Datos mockeados de usuario por ahora
  const userRole = 'admin'
  const userName = 'Administrador General'
  const zona = 'Consolidado Nacional'

  return (
    <div className="app-layout">
      <Sidebar 
        userRole={userRole}
        userName={userName}
        zona={zona}
        alertasRojas={5} // Mock
      />
      <main className="main-content">
        <Header 
          title="SGPI INIA"
          subtitle="Sistema de Gestión de Proyectos e Histórico Integrado"
        />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
