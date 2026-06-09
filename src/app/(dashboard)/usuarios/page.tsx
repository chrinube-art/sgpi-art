import { turso } from '@/lib/db/turso'

export default async function UsuariosPage() {
  const result = await turso.execute('SELECT * FROM user_roles ORDER BY created_at DESC')
  const usuarios = result.rows

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">⚙️ Usuarios y Roles</h2>
        <div className="card-subtitle">Administración de credenciales y permisos por Macrozona.</div>
      </div>
      <div className="card-body">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Correo Institucional</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Centro / Macrozona</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u: any, i) => (
                <tr key={i}>
                  <td><strong>{u.email}</strong></td>
                  <td>{u.nombre}</td>
                  <td>
                    <span className="badge badge-gray">{u.rol}</span>
                  </td>
                  <td>{u.centro || 'Nacional'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
