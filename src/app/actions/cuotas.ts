'use server'

import { turso } from '@/lib/db/turso'
import { type Cuota } from '@/lib/types'

export async function getCuotasByProject(codigo_proyecto: string): Promise<Cuota[]> {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM cuotas WHERE codigo_proyecto = ? AND snapshot_id IS NULL ORDER BY cuota ASC',
      args: [codigo_proyecto]
    })
    
    // Map SQLite rows to Cuota type
    return result.rows.map(r => ({
      codigo_proyecto: r.codigo_proyecto as string,
      cri: r.cri as string,
      ff: r.ff as string,
      titulo_proyecto: r.titulo_proyecto as string,
      estado: r.estado as string,
      jefe_proyecto: r.jefe_proyecto as string,
      contrato: r.contrato as string,
      nombre_contrato: r.nombre_contrato as string,
      fuente_financiamiento: r.fuente_financiamiento as string,
      cuota: r.cuota as number,
      monto: r.monto as number,
      fecha_ingreso_cuotas: r.fecha_ingreso_cuotas as string,
      anio_ingreso_cuota: r.anio_ingreso_cuota as number,
      mes_ingreso_cuota: r.mes_ingreso_cuota as number,
      fecha_termino_contrato: r.fecha_termino_contrato as string,
      fecha_ingreso: r.fecha_ingreso as string,
      ingresado_sgpi: r.ingresado_sgpi === 1,
      monto_recibido: r.monto_recibido as number,
      snapshot_id: r.snapshot_id as number | undefined
    }))
  } catch (e) {
    console.error("Error fetching cuotas:", e)
    return []
  }
}
