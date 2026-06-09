import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirigir a la vista principal de proyectos que es el corazón del sistema
  redirect('/proyectos')
}
