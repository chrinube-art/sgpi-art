import { redirect } from 'next/navigation'

export default function Home() {
  // Por ahora redirigimos directamente al dashboard
  // Cuando se implemente autenticación, aquí se evaluaría la sesión
  redirect('/dashboard')
}
