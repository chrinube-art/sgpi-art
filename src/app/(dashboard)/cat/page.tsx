import CATHeatmap from '@/components/cat/CATHeatmap'
import { turso } from '@/lib/db/turso'
import { type CatEntry } from '@/lib/types'

export default async function CATPage() {
  // Cargar datos CAT reales, solo los actuales (sin snapshot)
  const result = await turso.execute('SELECT * FROM cat_entries WHERE snapshot_id IS NULL')
  
  const entries: CatEntry[] = result.rows.map(r => ({
    codigo_proyecto: r.codigo_proyecto as string,
    titulo_proyecto: r.titulo_proyecto as string,
    anio: r.anio as number,
    cod_dep_empleado: r.cod_dep_empleado as string,
    dep_empleado: r.dep_empleado as string,
    empleado: r.empleado as string,
    rut: r.rut as string,
    tipo_financiamiento: r.tipo_financiamiento as string,
    cod_dep: r.cod_dep as string,
    dependencia: r.dependencia as string,
    cod_ff: r.cod_ff as string,
    fuente_financiamiento: r.fuente_financiamiento as string,
    estado_proyecto: r.estado_proyecto as string,
    ene: r.ene as number, feb: r.feb as number, mar: r.mar as number,
    abr: r.abr as number, may: r.may as number, jun: r.jun as number,
    jul: r.jul as number, ago: r.ago as number, sep: r.sep as number,
    oct: r.oct as number, nov: r.nov as number, dic: r.dic as number,
    snapshot_id: r.snapshot_id as number | undefined
  }))

  const anio = new Date().getFullYear()

  return (
    <div>
      <CATHeatmap entries={entries} anio={anio} />
    </div>
  )
}
