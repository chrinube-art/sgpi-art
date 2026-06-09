-- src/lib/db/schema.sql
-- Script DDL para SGPI-INIA en SQLite (Turso)

-- ==========================================
-- 1. TABLAS PRINCIPALES
-- ==========================================

-- Tabla de Usuarios y Roles (Manejado por la App ahora)
CREATE TABLE IF NOT EXISTS user_roles (
  email TEXT PRIMARY KEY,
  nombre TEXT,
  rol TEXT CHECK (rol IN ('admin', 'director_ohiggins', 'director_maule', 'investigador_ohiggins', 'investigador_maule')) NOT NULL,
  centro TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Core de Proyectos (La llave inmutable es el código)
CREATE TABLE IF NOT EXISTS projects (
  codigo_proyecto TEXT PRIMARY KEY,
  nombre_ff TEXT,
  ff TEXT,
  estado_codigo TEXT,
  estado_formulario TEXT,
  estado_acta_inicio TEXT,
  estado_contrato TEXT,
  titulo_proyecto TEXT NOT NULL,
  jefe_proyecto TEXT,
  estado_proyecto TEXT,
  dependencia TEXT,
  desde TEXT, -- DATE en formato YYYY-MM-DD
  hasta TEXT, -- DATE en formato YYYY-MM-DD
  monto_ff REAL DEFAULT 0,
  pecunio_asociado REAL DEFAULT 0,
  no_pecunio_asociado REAL DEFAULT 0,
  pecunio_inia REAL DEFAULT 0,
  no_pecunio_inia REAL DEFAULT 0,
  total_proyecto REAL DEFAULT 0,
  codigo_externo TEXT,
  macrozona TEXT CHECK (macrozona IN ('ohiggins', 'maule', NULL)),
  centro_propietario TEXT CHECK (centro_propietario IN ('rayentue', 'hidango', 'raihuen', 'cauquenes', NULL)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Snapshots Mensuales (Congelamientos)
CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  periodo TEXT NOT NULL UNIQUE, -- Formato: 'YYYY-MM'
  cerrado_por TEXT REFERENCES user_roles(email),
  cerrado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_locked BOOLEAN DEFAULT 1
);

-- Tabla de Carga Anual de Trabajo (CAT)
CREATE TABLE IF NOT EXISTS cat_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_proyecto TEXT REFERENCES projects(codigo_proyecto) ON DELETE CASCADE,
  titulo_proyecto TEXT,
  anio INTEGER NOT NULL,
  cod_dep_empleado TEXT,
  dep_empleado TEXT,
  empleado TEXT NOT NULL,
  rut TEXT NOT NULL,
  tipo_financiamiento TEXT,
  cod_dep TEXT,
  dependencia TEXT,
  cod_ff TEXT,
  fuente_financiamiento TEXT,
  estado_proyecto TEXT,
  ene REAL DEFAULT 0,
  feb REAL DEFAULT 0,
  mar REAL DEFAULT 0,
  abr REAL DEFAULT 0,
  may REAL DEFAULT 0,
  jun REAL DEFAULT 0,
  jul REAL DEFAULT 0,
  ago REAL DEFAULT 0,
  sep REAL DEFAULT 0,
  oct REAL DEFAULT 0,
  nov REAL DEFAULT 0,
  dic REAL DEFAULT 0,
  snapshot_id INTEGER REFERENCES snapshots(id) ON DELETE SET NULL,
  UNIQUE(codigo_proyecto, rut, anio, snapshot_id)
);

-- Tabla de Cuotas y Control Financiero
CREATE TABLE IF NOT EXISTS cuotas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_proyecto TEXT REFERENCES projects(codigo_proyecto) ON DELETE CASCADE,
  cri TEXT,
  ff TEXT,
  titulo_proyecto TEXT,
  estado TEXT,
  jefe_proyecto TEXT,
  contrato TEXT,
  nombre_contrato TEXT,
  fuente_financiamiento TEXT,
  cuota INTEGER,
  monto REAL DEFAULT 0,
  fecha_ingreso_cuotas TEXT, -- Formato: YYYY-MM-DD
  anio_ingreso_cuota INTEGER,
  mes_ingreso_cuota INTEGER,
  fecha_termino_contrato TEXT, -- Formato: YYYY-MM-DD
  fecha_ingreso TEXT, -- Formato: YYYY-MM-DD
  ingresado_sgpi BOOLEAN DEFAULT 0,
  monto_recibido REAL DEFAULT 0,
  snapshot_id INTEGER REFERENCES snapshots(id) ON DELETE SET NULL
);

-- ==========================================
-- 2. DATOS INICIALES MOCK PARA TEST
-- ==========================================
INSERT OR IGNORE INTO user_roles (email, nombre, rol, centro) VALUES 
('admin@inia.cl', 'Administrador General', 'admin', NULL),
('director.ohiggins@inia.cl', 'Director Regional Ohiggins', 'director_ohiggins', 'rayentue'),
('director.maule@inia.cl', 'Director Regional Maule', 'director_maule', 'raihuen');
