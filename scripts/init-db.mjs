import fs from 'fs'
import path from 'path'
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

async function main() {
  console.log("Inicializando base de datos Turso...")
  const schemaPath = path.resolve(__dirname, '../src/lib/db/schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  try {
    // executeMultiple soporta múltiples declaraciones separadas por ;
    await turso.executeMultiple(schemaSql)
    console.log("✅ Esquema de base de datos inicializado exitosamente en Turso.")
    
    // Check tables
    const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'")
    console.log("Tablas creadas:", tables.rows.map(r => r.name).join(', '))
  } catch (error) {
    console.error("❌ Error al inicializar esquema:", error)
  }
}

main()
