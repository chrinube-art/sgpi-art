import { NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { type Project, type CatEntry, type Cuota } from '@/lib/types'

function inferCentroMacrozona(p: Project) {
  let centro: Project['centro_propietario'] = 'rayentue'
  let macrozona: Project['macrozona'] = 'ohiggins'
  const dep = (p.dependencia || '').toLowerCase()
  if (dep.includes('raihuen') || dep.includes('cauquenes')) {
    macrozona = 'maule'
    centro = dep.includes('cauquenes') ? 'cauquenes' : 'raihuen'
  } else if (dep.includes('hidango')) {
    centro = 'hidango'
  }
  return { centro, macrozona }
}

export async function POST(request: Request) {
  try {
    // 1. Auth check: (Próximamente con NextAuth: getServerSession)
    // Para RLS: Si el usuario no es admin, abortar import.

    const payload = await request.json()
    const type = payload.type as 'bbdd' | 'cat' | 'cuotas'
    const rows = payload.data

    if (!type || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    let inserted = 0
    const tx = await turso.transaction("write")

    try {
      if (type === 'bbdd') {
        // Upsert en SQLite
        const stmt = `
          INSERT INTO projects (
            codigo_proyecto, nombre_ff, ff, estado_codigo, estado_formulario, estado_acta_inicio,
            estado_contrato, titulo_proyecto, jefe_proyecto, estado_proyecto, dependencia,
            desde, hasta, monto_ff, pecunio_asociado, no_pecunio_asociado, pecunio_inia,
            no_pecunio_inia, total_proyecto, codigo_externo, macrozona, centro_propietario
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(codigo_proyecto) DO UPDATE SET
            nombre_ff=excluded.nombre_ff, ff=excluded.ff, estado_codigo=excluded.estado_codigo,
            estado_formulario=excluded.estado_formulario, estado_acta_inicio=excluded.estado_acta_inicio,
            estado_contrato=excluded.estado_contrato, titulo_proyecto=excluded.titulo_proyecto,
            jefe_proyecto=excluded.jefe_proyecto, estado_proyecto=excluded.estado_proyecto,
            dependencia=excluded.dependencia, desde=excluded.desde, hasta=excluded.hasta,
            monto_ff=excluded.monto_ff, pecunio_asociado=excluded.pecunio_asociado,
            no_pecunio_asociado=excluded.no_pecunio_asociado, pecunio_inia=excluded.pecunio_inia,
            no_pecunio_inia=excluded.no_pecunio_inia, total_proyecto=excluded.total_proyecto,
            codigo_externo=excluded.codigo_externo, macrozona=excluded.macrozona,
            centro_propietario=excluded.centro_propietario, updated_at=CURRENT_TIMESTAMP
        `
        for (const r of rows as Project[]) {
          const { centro, macrozona } = inferCentroMacrozona(r)
          await tx.execute({
            sql: stmt,
            args: [
              r.codigo_proyecto, r.nombre_ff, r.ff, r.estado_codigo, r.estado_formulario, r.estado_acta_inicio,
              r.estado_contrato, r.titulo_proyecto, r.jefe_proyecto, r.estado_proyecto, r.dependencia,
              r.desde, r.hasta, r.monto_ff, r.pecunio_asociado, r.no_pecunio_asociado, r.pecunio_inia,
              r.no_pecunio_inia, r.total_proyecto, r.codigo_externo, macrozona, centro
            ]
          })
        }
        inserted = rows.length
      }

      else if (type === 'cat') {
        const cats = rows as CatEntry[]
        const codigos = [...new Set(cats.map(c => c.codigo_proyecto))]
        
        if (codigos.length > 0) {
          // Delete old data not snapshoted
          const placeholders = codigos.map(() => '?').join(',')
          await tx.execute({
            sql: `DELETE FROM cat_entries WHERE codigo_proyecto IN (${placeholders}) AND snapshot_id IS NULL`,
            args: codigos
          })
        }

        const stmt = `
          INSERT INTO cat_entries (
            codigo_proyecto, titulo_proyecto, anio, cod_dep_empleado, dep_empleado, empleado,
            rut, tipo_financiamiento, cod_dep, dependencia, cod_ff, fuente_financiamiento,
            estado_proyecto, ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        for (const c of cats) {
          await tx.execute({
            sql: stmt,
            args: [
              c.codigo_proyecto, c.titulo_proyecto, c.anio, c.cod_dep_empleado, c.dep_empleado, c.empleado,
              c.rut, c.tipo_financiamiento, c.cod_dep, c.dependencia, c.cod_ff, c.fuente_financiamiento,
              c.estado_proyecto, c.ene, c.feb, c.mar, c.abr, c.may, c.jun, c.jul, c.ago, c.sep, c.oct, c.nov, c.dic
            ]
          })
        }
        inserted = cats.length
      }

      else if (type === 'cuotas') {
        const cuotas = rows as Cuota[]
        const codigos = [...new Set(cuotas.map(c => c.codigo_proyecto))]

        if (codigos.length > 0) {
          const placeholders = codigos.map(() => '?').join(',')
          await tx.execute({
            sql: `DELETE FROM cuotas WHERE codigo_proyecto IN (${placeholders}) AND snapshot_id IS NULL`,
            args: codigos
          })
        }

        const stmt = `
          INSERT INTO cuotas (
            codigo_proyecto, cri, ff, titulo_proyecto, estado, jefe_proyecto, contrato,
            nombre_contrato, fuente_financiamiento, cuota, monto, fecha_ingreso_cuotas,
            anio_ingreso_cuota, mes_ingreso_cuota, fecha_termino_contrato, fecha_ingreso,
            ingresado_sgpi, monto_recibido
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        for (const c of cuotas) {
          await tx.execute({
            sql: stmt,
            args: [
              c.codigo_proyecto, c.cri, c.ff, c.titulo_proyecto, c.estado, c.jefe_proyecto, c.contrato,
              c.nombre_contrato, c.fuente_financiamiento, c.cuota, c.monto, c.fecha_ingreso_cuotas,
              c.anio_ingreso_cuota, c.mes_ingreso_cuota, c.fecha_termino_contrato, c.fecha_ingreso,
              c.ingresado_sgpi ? 1 : 0, c.monto_recibido
            ]
          })
        }
        inserted = cuotas.length
      }

      await tx.commit()
    } catch (e) {
      await tx.rollback()
      throw e
    }

    return NextResponse.json({ 
      success: true, 
      message: `${inserted} registros procesados correctamente en la tabla ${type}.` 
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message || 'Error interno al importar datos' }, { status: 500 })
  }
}
