'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorUrl = searchParams.get('error')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (res?.error) {
      setErrorMsg('Credenciales inválidas o usuario no registrado.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div>
          <h1 className="login-title">SGPI</h1>
          <div className="login-subtitle">Sistema de Gestión de Proyectos e Histórico Integrado</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="alert alert-rojo" style={{ marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}
          {errorUrl && !errorMsg && (
            <div className="alert alert-rojo" style={{ marginBottom: 16 }}>
              Acceso denegado. Por favor, inicie sesión.
            </div>
          )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-container"><div className="login-box" style={{textAlign:'center'}}>Cargando plataforma...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}
