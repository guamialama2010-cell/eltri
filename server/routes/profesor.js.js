import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { allQuery, getQuery } from '../db.js';

const router = express.Router();

// Obtener datos del profesor
router.get('/perfil', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const usuario = await getQuery(
      'SELECT id, nombre, correo FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Obtener materias del profesor
router.get('/materias', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const materias = await allQuery(`
      SELECT * FROM materias
      WHERE profesor_id = ?
      ORDER BY nombre
    `, [req.usuario.id]);

    res.json(materias);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

// Obtener estudiantes inscritos en una materia
router.get(
  '/materias/:materiaId/estudiantes',
  verificarToken,
  verificarRol(['profesor']),
  async (req, res) => {
    try {
      const { materiaId } = req.params;

      const materia = await getQuery(
        'SELECT * FROM materias WHERE id = ? AND profesor_id = ?',
        [materiaId, req.usuario.id]
      );

      if (!materia) {
        return res.status(403).json({
          error: 'No tienes permiso para ver esta materia'
        });
      }

      const estudiantes = await allQuery(`
        SELECT u.*
        FROM usuarios u
        INNER JOIN inscripciones i ON u.id = i.estudiante_id
        WHERE i.materia_id = ?
          AND u.rol = 'estudiante'
      `, [materiaId]);

      res.json(estudiantes);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({
        error: 'Error al obtener estudiantes'
      });
    }
  }
);

// Obtener tareas de una materia
router.get(
  '/tareas/:materiaId',
  verificarToken,
  verificarRol(['profesor']),
  async (req, res) => {
    try {
      const { materiaId } = req.params;

      // Verificar que la materia pertenece al profesor
      const materia = await getQuery(
        'SELECT * FROM materias WHERE id = ? AND profesor_id = ?',
        [materiaId, req.usuario.id]
      );

      if (!materia) {
        return res.status(403).json({
          error: 'No tienes permiso para ver las tareas de esta materia'
        });
      }

      const tareas = await allQuery(`
        SELECT *
        FROM tareas
        WHERE materia_id = ?
          AND profesor_id = ?
        ORDER BY fecha_entrega ASC
      `, [materiaId, req.usuario.id]);

      res.json(tareas);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({
        error: 'Error al obtener tareas'
      });
    }
  }
);

// Obtener todas las entregas de una tarea
router.get(
  '/tareas/:tareaId/entregas',
  verificarToken,
  verificarRol(['profesor']),
  async (req, res) => {
    try {
      const { tareaId } = req.params;

      const tarea = await getQuery(
        'SELECT * FROM tareas WHERE id = ? AND profesor_id = ?',
        [tareaId, req.usuario.id]
      );

      if (!tarea) {
        return res.status(403).json({
          error: 'No tienes permiso para ver esta tarea'
        });
      }

      const entregas = await allQuery(`
        SELECT
          e.*,
          u.nombre AS estudiante_nombre,
          u.correo
        FROM entregas e
        INNER JOIN usuarios u ON e.estudiante_id = u.id
        WHERE e.tarea_id = ?
        ORDER BY e.fecha_entrega DESC
      `, [tareaId]);

      res.json(entregas);
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      res.status(500).json({
        error: 'Error al obtener entregas'
      });
    }
  }
);

// Obtener promedios de una materia
router.get(
  '/materias/:materiaId/promedios',
  verificarToken,
  verificarRol(['profesor']),
  async (req, res) => {
    try {
      const { materiaId } = req.params;

      const materia = await getQuery(
        'SELECT * FROM materias WHERE id = ? AND profesor_id = ?',
        [materiaId, req.usuario.id]
      );

      if (!materia) {
        return res.status(403).json({
          error: 'No tienes permiso'
        });
      }

      const promedios = await allQuery(`
        SELECT
          u.id,
          u.nombre,
          u.correo,
          AVG(c.calificacion) AS promedio,
          COUNT(c.id) AS total_calificaciones
        FROM usuarios u
        INNER JOIN inscripciones i
          ON u.id = i.estudiante_id
        LEFT JOIN calificaciones c
          ON u.id = c.estudiante_id
          AND c.materia_id = ?
        WHERE i.materia_id = ?
          AND u.rol = 'estudiante'
        GROUP BY u.id, u.nombre, u.correo
      `, [materiaId, materiaId]);

      res.json(promedios);
    } catch (error) {
      console.error('Error al obtener promedios:', error);
      res.status(500).json({
        error: 'Error al obtener promedios'
      });
    }
  }
);

export default router;