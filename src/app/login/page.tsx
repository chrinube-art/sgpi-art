'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate login delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div>
          <h1 className="login-title">SGPI</h1>
          <div className="login-subtitle">Sistema de Gestión de Proyectos e Histórico Integrado</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="usuario@inia.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading || !email || !password}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
          Instituto de Investigaciones Agropecuarias<br/>Ministerio de Agricultura
        </div>
      </div>
      
      <div className="login-hero">
        <img 
          src="/logo-inia.png" 
          alt="Logo INIA" 
          className="login-logo"
        />
      </div>
    </div>
  )
}
