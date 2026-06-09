import fs from 'fs'
import path from 'path'
import { createClient } from '@libsql/client'

// Use env from process or hardcode for init script if not running via Next
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

  // Split schema into individual statements
  // SQLite multiple statements can be tricky via client depending on driver, so we split.
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  try {
    for (const stmt of statements) {
      // Remove inline comments for safety
      const cleanStmt = stmt.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim()
      if(cleanStmt) {
        await turso.execute(cleanStmt)
        console.log(`Ejecutado: ${cleanStmt.substring(0, 50)}...`)
      }
    }
    console.log("✅ Esquema de base de datos inicializado exitosamente.")
  } catch (error) {
    console.error("❌ Error al inicializar esquema:", error)
  }
}

main()
