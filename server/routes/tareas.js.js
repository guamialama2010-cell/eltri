import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { allQuery, getQuery, runQuery } from '../db.js';

const router = express.Router();

// Crear tarea (solo profesor)
router.post('/', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { materia_id, titulo, descripcion, instrucciones, fecha_entrega } = req.body;

    if (!materia_id || !titulo || !fecha_entrega) {
      return res.status(400).json({ error: 'Materia, título y fecha de entrega son requeridos' });
    }

    // Verificar que el profesor es dueño de la materia
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [materia_id, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso para crear tareas en esta materia' });
    }

    const resultado = await runQuery(
      `INSERT INTO tareas (materia_id, profesor_id, titulo, descripcion, instrucciones, fecha_entrega) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [materia_id, req.usuario.id, titulo, descripcion || '', instrucciones || '', fecha_entrega]
    );

    res.status(201).json({
      id: resultado.id,
      materia_id,
      titulo,
      descripcion,
      instrucciones,
      fecha_entrega
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Obtener tarea por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const tarea = await getQuery('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
});

// Actualizar tarea (solo profesor dueño)
router.put('/:id', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, instrucciones, fecha_entrega } = req.body;

    // Verificar que el profesor es dueño
    const tarea = await getQuery('SELECT * FROM tareas WHERE id = ? AND profesor_id = ?', [id, req.usuario.id]);
    if (!tarea) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
    }

    await runQuery(
      `UPDATE tareas SET titulo = ?, descripcion = ?, instrucciones = ?, fecha_entrega = ? WHERE id = ?`,
      [titulo, descripcion, instrucciones, fecha_entrega, id]
    );

    res.json({ mensaje: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Entregar tarea (estudiante)
router.post('/:tareaId/entregar', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const { tareaId } = req.params;
    const { comentario_estudiante, archivo_nombre } = req.body;

    // Verificar que la tarea existe
    const tarea = await getQuery('SELECT * FROM tareas WHERE id = ?', [tareaId]);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar que el estudiante está inscrito en la materia
    const inscripcion = await getQuery(
      'SELECT * FROM inscripciones WHERE estudiante_id = ? AND materia_id = ?',
      [req.usuario.id, tarea.materia_id]
    );
    if (!inscripcion) {
      return res.status(403).json({ error: 'No estás inscrito en esta materia' });
    }

    // Verificar si ya entregó
    const entregaExistente = await getQuery(
      'SELECT * FROM entregas WHERE tarea_id = ? AND estudiante_id = ?',
      [tareaId, req.usuario.id]
    );

    const ahora = new Date();
    const fechaEntrega = new Date(tarea.fecha_entrega);
    const estado = ahora > fechaEntrega ? 'tardio' : 'entregado';

    if (entregaExistente) {
      // Actualizar entrega existente
      await runQuery(
        `UPDATE entregas SET comentario_estudiante = ?, archivo_nombre = ?, estado = ? WHERE id = ?`,
        [comentario_estudiante || '', archivo_nombre || 'archivo.pdf', estado, entregaExistente.id]
      );
      res.json({ mensaje: 'Tarea actualizada', id: entregaExistente.id });
    } else {
      // Crear nueva entrega
      const resultado = await runQuery(
        `INSERT INTO entregas (tarea_id, estudiante_id, comentario_estudiante, archivo_nombre, estado) 
         VALUES (?, ?, ?, ?, ?)`,
        [tareaId, req.usuario.id, comentario_estudiante || '', archivo_nombre || 'archivo.pdf', estado]
      );
      res.status(201).json({ 
        mensaje: 'Tarea entregada',
        id: resultado.id,
        estado
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al entregar tarea' });
  }
});

// Obtener entregas de un estudiante
router.get('/:tareaId/mi-entrega', verificarToken, verificarRol(['estudiante']), async (req, res) => {
  try {
    const { tareaId } = req.params;
    const entrega = await getQuery(
      'SELECT * FROM entregas WHERE tarea_id = ? AND estudiante_id = ?',
      [tareaId, req.usuario.id]
    );
    res.json(entrega || null);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entrega' });
  }
});

export default router;
