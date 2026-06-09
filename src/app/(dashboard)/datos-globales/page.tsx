import GlobalDataTables from '@/components/dashboard/GlobalDataTables'
import { turso } from '@/lib/db/turso'
import { type Project } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DatosGlobalesPage() {
  const result = await turso.execute('SELECT * FROM projects')
  const projects = result.rows as unknown as Project[]

  return (
    <div className="fade-in" style={{ padding: '24px' }}>
      <h1 className="text-2xl font-bold" style={{ marginBottom: '24px' }}>Hoja de Datos Globales (KPIs)</h1>
      <GlobalDataTables initialProjects={projects} />
    </div>
  )
}
