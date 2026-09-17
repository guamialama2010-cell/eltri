import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { allQuery, getQuery, runQuery } from '../db.js';

const router = express.Router();

// Registrar o actualizar calificación (solo profesor)
router.post('/', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { entrega_id, tarea_id, estudiante_id, materia_id, calificacion, comentario_profesor } = req.body;

    if (!estudiante_id || !materia_id || calificacion === undefined) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    if (calificacion < 0 || calificacion > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 0 y 5' });
    }

    // Verificar que el profesor tiene materia
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [materia_id, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso para calificar en esta materia' });
    }

    // Verificar si ya existe calificación para esta entrega
    let calificacionExistente = null;
    if (entrega_id) {
      calificacionExistente = await getQuery(
        'SELECT id FROM calificaciones WHERE entrega_id = ?',
        [entrega_id]
      );
    }

    if (calificacionExistente) {
      // Actualizar
      await runQuery(
        `UPDATE calificaciones SET calificacion = ?, comentario_profesor = ? WHERE id = ?`,
        [calificacion, comentario_profesor || '', calificacionExistente.id]
      );
      res.json({ 
        mensaje: 'Calificación actualizada',
        id: calificacionExistente.id
      });
    } else {
      // Crear nueva
      const resultado = await runQuery(
        `INSERT INTO calificaciones (entrega_id, tarea_id, estudiante_id, materia_id, calificacion, comentario_profesor) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entrega_id || null, tarea_id || null, estudiante_id, materia_id, calificacion, comentario_profesor || '']
      );
      res.status(201).json({ 
        mensaje: 'Calificación registrada',
        id: resultado.id
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar calificación' });
  }
});

// Obtener calificaciones de un estudiante
router.get('/estudiante/:estudianteId', verificarToken, async (req, res) => {
  try {
    const { estudianteId } = req.params;

    // Si es estudiante, solo puede ver sus propias calificaciones
    if (req.usuario.rol === 'estudiante' && req.usuario.id != estudianteId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const calificaciones = await allQuery(`
      SELECT c.*, t.titulo as tarea_titulo, m.nombre as materia_nombre
      FROM calificaciones c
      LEFT JOIN tareas t ON c.tarea_id = t.id
      INNER JOIN materias m ON c.materia_id = m.id
      WHERE c.estudiante_id = ?
      ORDER BY c.fecha_calificacion DESC
    `, [estudianteId]);

    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

// Obtener calificaciones por materia
router.get('/materia/:materiaId', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { materiaId } = req.params;

    // Verificar que el profesor es dueño
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [materiaId, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const calificaciones = await allQuery(`
      SELECT c.*, u.nombre as estudiante_nombre, t.titulo as tarea_titulo
      FROM calificaciones c
      INNER JOIN usuarios u ON c.estudiante_id = u.id
      LEFT JOIN tareas t ON c.tarea_id = t.id
      WHERE c.materia_id = ?
      ORDER BY u.nombre, c.fecha_calificacion DESC
    `, [materiaId]);

    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

// Eliminar calificación (solo profesor)
router.delete('/:id', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { id } = req.params;

    const calificacion = await getQuery('SELECT * FROM calificaciones WHERE id = ?', [id]);
    if (!calificacion) {
      return res.status(404).json({ error: 'Calificación no encontrada' });
    }

    // Verificar que el profesor es dueño de la materia
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [calificacion.materia_id, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    await runQuery('DELETE FROM calificaciones WHERE id = ?', [id]);
    res.json({ mensaje: 'Calificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar calificación' });
  }
});

export default router;
