import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { allQuery, getQuery } from '../db.js';

const router = express.Router();

// Obtener datos del estudiante
router.get('/perfil', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const usuario = await getQuery('SELECT id, nombre, correo, grado, curso FROM usuarios WHERE id = ?', [req.usuario.id]);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Obtener materias del estudiante
router.get('/materias', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const materias = await allQuery(`
      SELECT m.* FROM materias m
      INNER JOIN inscripciones i ON m.id = i.materia_id
      WHERE i.estudiante_id = ?
      ORDER BY m.nombre
    `, [req.usuario.id]);

    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

// Obtener tareas pendientes
router.get('/tareas', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const tareas = await allQuery(`
      SELECT t.*, m.nombre as materia_nombre, u.nombre as profesor_nombre
      FROM tareas t
      INNER JOIN materias m ON t.materia_id = m.id
      INNER JOIN usuarios u ON t.profesor_id = u.id
      INNER JOIN inscripciones i ON m.id = i.materia_id
      WHERE i.estudiante_id = ?
      ORDER BY t.fecha_entrega ASC
    `, [req.usuario.id]);

    // Obtener estado de entrega para cada tarea
    for (let tarea of tareas) {
      const entrega = await getQuery(`
        SELECT * FROM entregas WHERE tarea_id = ? AND estudiante_id = ?
      `, [tarea.id, req.usuario.id]);
      tarea.entregado = !!entrega;
      tarea.entrega_id = entrega?.id;
    }

    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Obtener calificaciones
router.get('/calificaciones', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const calificaciones = await allQuery(`
      SELECT c.*, m.nombre as materia_nombre, t.titulo as tarea_titulo
      FROM calificaciones c
      INNER JOIN materias m ON c.materia_id = m.id
      LEFT JOIN tareas t ON c.tarea_id = t.id
      WHERE c.estudiante_id = ?
      ORDER BY c.fecha_calificacion DESC
    `, [req.usuario.id]);

    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

// Obtener promedios por materia
router.get('/promedios', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const promedios = await allQuery(`
      SELECT 
        m.id,
        m.nombre,
        AVG(c.calificacion) as promedio
      FROM materias m
      INNER JOIN inscripciones i ON m.id = i.materia_id
      LEFT JOIN calificaciones c ON m.id = c.materia_id
      WHERE i.estudiante_id = ?
      GROUP BY m.id, m.nombre
    `, [req.usuario.id]);

    res.json(promedios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener promedios' });
  }
});

export default router;
