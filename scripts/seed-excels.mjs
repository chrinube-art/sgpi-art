import fs from 'fs'
import path from 'path'
import xlsx from 'xlsx'
import { createClient } from '@libsql/client'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envConfig = {}
envContent.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=')
    envConfig[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
  }
})

const turso = createClient({
  url: envConfig.TURSO_DATABASE_URL,
  authToken: envConfig.TURSO_AUTH_TOKEN,
})

function inferCentroMacrozona(dependencia) {
  let centro = 'rayentue'
  let macrozona = 'ohiggins'
  const dep = (dependencia || '').toLowerCase()
  if (dep.includes('raihuen') || dep.includes('cauquenes') || dep.includes('maule')) {
    macrozona = 'maule'
    centro = dep.includes('cauquenes') ? 'cauquenes' : 'raihuen'
  } else if (dep.includes('hidango')) {
    centro = 'hidango'
  }
  return { centro, macrozona }
}

function extractExcelDate(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'number') {
    // Excel base date is 1899-12-30
    const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
    // return YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }
  // Try to parse string
  return String(excelDate);
}

function parseNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

function cleanString(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (str === 'Sin Información' || str === '') return null;
  return str;
}

async function main() {
  console.log("Iniciando inyección de datos desde Excels locales...")
  
  // Limpiar tablas previas (excepto user_roles y snapshots)
  await turso.executeMultiple(`
    DELETE FROM projects;
    DELETE FROM cat_entries;
    DELETE FROM cuotas;
  `)
  console.log("Tablas limpiadas.")

  let totalProjects = 0
  let totalCats = 0
  let totalCuotas = 0

  // 1. DASHBOARD RAYENTUE
  try {
    const fileRay = path.resolve(__dirname, '../DASHBOARD RAYENTUE CONSOLIDADO al 03-2026.xlsx')
    const wbRay = xlsx.readFile(fileRay)
    const dataRay = xlsx.utils.sheet_to_json(wbRay.Sheets['Hoja4'], { header: 1 })
    
    // Header is row 0, data starts at row 1
    for (let i = 1; i < dataRay.length; i++) {
      const row = dataRay[i]
      if (!row || !row[1]) continue // Skip empty rows or without codigo
      const codigo = String(row[1])
      if (codigo === 'Sin Información' || codigo.trim() === '') continue;

      const { centro, macrozona } = inferCentroMacrozona(row[0])
      
      const args = [
        cleanString(row[1]), cleanString(row[2]), cleanString(row[3]), cleanString(row[5]),
        cleanString(row[6]), cleanString(row[7]), cleanString(row[8]), cleanString(row[9]),
        cleanString(row[10]), cleanString(row[11]), cleanString(row[0]),
        extractExcelDate(row[12]), extractExcelDate(row[13]),
        parseNumber(row[14]), parseNumber(row[15]), parseNumber(row[16]), parseNumber(row[17]), parseNumber(row[18]), parseNumber(row[19]),
        cleanString(row[20]), macrozona, centro
      ].map(v => v === undefined ? null : v)

      await turso.execute({
        sql: `INSERT OR REPLACE INTO projects (
          codigo_proyecto, nombre_ff, ff, estado_codigo, estado_formulario, estado_acta_inicio,
          estado_contrato, titulo_proyecto, jefe_proyecto, estado_proyecto, dependencia,
          desde, hasta, monto_ff, pecunio_asociado, no_pecunio_asociado, pecunio_inia,
          no_pecunio_inia, total_proyecto, codigo_externo, macrozona, centro_propietario
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args
      })
      totalProjects++
    }
    console.log("✔️ BBDD Rayentue importada.")
  } catch(e) { console.error("Error Rayentue:", e.message) }

  // 2. DASHBOARD RAIHUEN
  try {
    const fileRai = path.resolve(__dirname, '../DASHBOARD RAIHUEN TODOS PROYECTOS AL 03-2026.xlsx')
    const wbRai = xlsx.readFile(fileRai)
    const dataRai = xlsx.utils.sheet_to_json(wbRai.Sheets['BBDD PY'], { header: 1 })
    
    // Header is row 1, data starts at row 2
    for (let i = 2; i < dataRai.length; i++) {
      const row = dataRai[i]
      if (!row || !row[1]) continue
      const codigo = String(row[1])
      if (codigo === 'Sin Información' || codigo.trim() === '') continue;

      const { centro, macrozona } = inferCentroMacrozona(row[0])
      
      const args = [
        cleanString(row[1]), cleanString(row[2]), cleanString(row[3]), cleanString(row[5]),
        cleanString(row[6]), cleanString(row[7]), cleanString(row[8]), cleanString(row[9]),
        cleanString(row[10]), cleanString(row[11]), cleanString(row[0]),
        extractExcelDate(row[12]), extractExcelDate(row[13]),
        parseNumber(row[14]), parseNumber(row[15]), parseNumber(row[16]), parseNumber(row[17]), parseNumber(row[18]), parseNumber(row[19]),
        cleanString(row[20]), macrozona, centro
      ].map(v => v === undefined ? null : v)

      await turso.execute({
        sql: `INSERT OR REPLACE INTO projects (
          codigo_proyecto, nombre_ff, ff, estado_codigo, estado_formulario, estado_acta_inicio,
          estado_contrato, titulo_proyecto, jefe_proyecto, estado_proyecto, dependencia,
          desde, hasta, monto_ff, pecunio_asociado, no_pecunio_asociado, pecunio_inia,
          no_pecunio_inia, total_proyecto, codigo_externo, macrozona, centro_propietario
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args
      })
      totalProjects++
    }
    console.log("✔️ BBDD Raihuen importada.")
  } catch(e) { console.error("Error Raihuen:", e.message) }

  // 3. CAT
  try {
    const fileCat = path.resolve(__dirname, '../Asignación CAT (porcentaje) - 2025-12-01 (Rayentue-Hidango-Raihuen-Cauquenes).xlsx')
    const wbCat = xlsx.readFile(fileCat)
    
    for (const sheet of ['CAT Rayentue-Hidango', 'CAT Raihuen-Cauquenes']) {
      const dataCat = xlsx.utils.sheet_to_json(wbCat.Sheets[sheet])
      for (const row of dataCat) {
        if (!row['Codigo proyecto']) continue;
        
        const args = [
          cleanString(row['Codigo proyecto'] || row['Código Proyecto']), 
          cleanString(row['Título de proyecto']), 
          parseNumber(row['Año']), 
          cleanString(row['Cód. Dep. Empleado']), 
          cleanString(row['Dep. Empleado']), 
          cleanString(row['Empleado']),
          cleanString(row['RUT']), 
          cleanString(row['Tipo Financiamiento']), 
          cleanString(row['Cód. Dep.']), 
          cleanString(row['Dependencia']), 
          cleanString(row['Cód. FF']), 
          cleanString(row['Fuente Financiamiento']),
          cleanString(row['Estado Proyecto']), 
          parseNumber(row['Ene']), parseNumber(row['Feb']), parseNumber(row['Mar']),
          parseNumber(row['Abr']), parseNumber(row['May']), parseNumber(row['Jun']),
          parseNumber(row['Jul']), parseNumber(row['Ago']), parseNumber(row['Sep']),
          parseNumber(row['Oct']), parseNumber(row['Nov']), parseNumber(row['Dic'])
        ].map(v => v === undefined ? null : v)

        try {
          await turso.execute({
            sql: `INSERT INTO cat_entries (
              codigo_proyecto, titulo_proyecto, anio, cod_dep_empleado, dep_empleado, empleado,
              rut, tipo_financiamiento, cod_dep, dependencia, cod_ff, fuente_financiamiento,
              estado_proyecto, ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args
          })
          totalCats++
        } catch(e) {
          // ignore foreign key errors for missing projects
        }
      }
    }
    console.log("✔️ CAT importado.")
  } catch(e) { console.error("Error CAT:", e.message) }

  // 4. CUOTAS
  try {
    const fileCuotas = path.resolve(__dirname, '../Cuotas SGPI 01-12-2025(Rayentue-Hidango-Raihuen-Cauquenes).xlsx')
    const wbCuotas = xlsx.readFile(fileCuotas)
    
    for (const sheet of ['Cuotas rayentue-hidango', 'Cuotas Raihuen-Cauquenes']) {
      const dataCuotas = xlsx.utils.sheet_to_json(wbCuotas.Sheets[sheet])
      for (const row of dataCuotas) {
        if (!row['Código']) continue;
        
        const args = [
          cleanString(row['Código']), cleanString(row['CRI']), cleanString(row['FF']), 
          cleanString(row['Título proyecto']), cleanString(row['Estado']), cleanString(row['Jefe Proyecto']), 
          cleanString(row['Contrato']), cleanString(row['Nombre Contrato']), cleanString(row['Fuente Financiamient']), 
          parseNumber(row['Cuota']), parseNumber(row['Monto']), extractExcelDate(row['Fecha Ingreso Cuotas']),
          parseNumber(row['Año Ingreso cuota']), parseNumber(row['Mes Ingreso cuota']), 
          extractExcelDate(row['Fecha de término del Contrato']), extractExcelDate(row['Fecha_ingreso']),
          row['Ingresado en SGPI'] === 'SI' || row['Ingresado en SGPI'] === true ? 1 : 0, 
          parseNumber(row['Monto recibido por rendición o Informe final'])
        ].map(v => v === undefined ? null : v)

        try {
          await turso.execute({
            sql: `INSERT INTO cuotas (
              codigo_proyecto, cri, ff, titulo_proyecto, estado, jefe_proyecto, contrato,
              nombre_contrato, fuente_financiamiento, cuota, monto, fecha_ingreso_cuotas,
              anio_ingreso_cuota, mes_ingreso_cuota, fecha_termino_contrato, fecha_ingreso,
              ingresado_sgpi, monto_recibido
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args
          })
          totalCuotas++
        } catch(e) {
          // ignore foreign key errors for missing projects
        }
      }
    }
    console.log("✔️ Cuotas importadas.")
  } catch(e) { console.error("Error Cuotas:", e.message) }

  console.log('--------------------------------------------------');
  console.log(`¡Éxito! Base de datos inicializada:`)
  console.log(` - ${totalProjects} Proyectos`)
  console.log(` - ${totalCats} Entradas CAT`)
  console.log(` - ${totalCuotas} Cuotas Financieras`)
  console.log('--------------------------------------------------');
}

main()
