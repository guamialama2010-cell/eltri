import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'eltri.db');

let db;

export async function initDatabase() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      contraseña TEXT NOT NULL,
      rol TEXT NOT NULL,
      grado TEXT,
      curso TEXT
    );

    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo TEXT UNIQUE NOT NULL,
      profesor_id INTEGER NOT NULL,
      descripcion TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estudiante_id INTEGER NOT NULL,
      materia_id INTEGER NOT NULL,
      UNIQUE(estudiante_id, materia_id)
    );

    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER NOT NULL,
      profesor_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      instrucciones TEXT DEFAULT '',
      fecha_entrega TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entregas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarea_id INTEGER NOT NULL,
      estudiante_id INTEGER NOT NULL,
      comentario_estudiante TEXT DEFAULT '',
      archivo_nombre TEXT DEFAULT '',
      estado TEXT NOT NULL,
      fecha_entrega DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entrega_id INTEGER,
      tarea_id INTEGER,
      estudiante_id INTEGER NOT NULL,
      materia_id INTEGER NOT NULL,
      calificacion REAL NOT NULL,
      comentario_profesor TEXT DEFAULT '',
      fecha_calificacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Base de datos SQLite conectada');
  console.log('Tablas de base de datos creadas');
}

export async function runQuery(sql, params = []) {
  return await db.run(sql, params);
}

export async function getQuery(sql, params = []) {
  return await db.get(sql, params);
}

export async function allQuery(sql, params = []) {
  return await db.all(sql, params);
}