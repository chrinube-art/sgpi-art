import { NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'

export async function POST(request: Request) {
  try {
    // 1. Validar permisos de Admin usando NextAuth
    // TODO: Require NextAuth server session

    const body = await request.json()
    const { periodo } = body

    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return NextResponse.json({ error: 'Formato de periodo inválido (use YYYY-MM)' }, { status: 400 })
    }

    const tx = await turso.transaction("write")

    try {
      // 2. Crear el registro Snapshot
      const snapRes = await tx.execute({
        sql: `INSERT INTO snapshots (periodo, is_locked) VALUES (?, 1) RETURNING id`,
        args: [periodo]
      })
      const snapshotId = snapRes.rows[0].id as number

      // 3. Clonar CAT
      await tx.execute({
        sql: `
          INSERT INTO cat_entries (
            codigo_proyecto, titulo_proyecto, anio, cod_dep_empleado, dep_empleado, empleado,
            rut, tipo_financiamiento, cod_dep, dependencia, cod_ff, fuente_financiamiento,
            estado_proyecto, ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic,
            snapshot_id
          )
          SELECT 
            codigo_proyecto, titulo_proyecto, anio, cod_dep_empleado, dep_empleado, empleado,
            rut, tipo_financiamiento, cod_dep, dependencia, cod_ff, fuente_financiamiento,
            estado_proyecto, ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic,
            ? AS snapshot_id
          FROM cat_entries 
          WHERE snapshot_id IS NULL
        `,
        args: [snapshotId]
      })

      // 4. Clonar Cuotas
      await tx.execute({
        sql: `
          INSERT INTO cuotas (
            codigo_proyecto, cri, ff, titulo_proyecto, estado, jefe_proyecto, contrato,
            nombre_contrato, fuente_financiamiento, cuota, monto, fecha_ingreso_cuotas,
            anio_ingreso_cuota, mes_ingreso_cuota, fecha_termino_contrato, fecha_ingreso,
            ingresado_sgpi, monto_recibido, snapshot_id
          )
          SELECT 
            codigo_proyecto, cri, ff, titulo_proyecto, estado, jefe_proyecto, contrato,
            nombre_contrato, fuente_financiamiento, cuota, monto, fecha_ingreso_cuotas,
            anio_ingreso_cuota, mes_ingreso_cuota, fecha_termino_contrato, fecha_ingreso,
            ingresado_sgpi, monto_recibido, ? AS snapshot_id
          FROM cuotas
          WHERE snapshot_id IS NULL
        `,
        args: [snapshotId]
      })

      await tx.commit()

    } catch (e: any) {
      await tx.rollback()
      if (e?.message?.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: `El periodo ${periodo} ya se encuentra congelado.` }, { status: 409 })
      }
      throw e
    }

    return NextResponse.json({ 
      success: true, 
      message: `El periodo ${periodo} ha sido cerrado y congelado exitosamente.`
    })

  } catch (error: any) {
    console.error('Snapshot error:', error)
    return NextResponse.json({ error: error.message || 'Error interno al congelar periodo' }, { status: 500 })
  }
}
