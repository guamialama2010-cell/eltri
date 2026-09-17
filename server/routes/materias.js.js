import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { allQuery, getQuery, runQuery } from '../db.js';

const router = express.Router();

// Crear materia (solo profesor)
router.post('/', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { nombre, codigo, descripcion } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({ error: 'Nombre y código son requeridos' });
    }

    const resultado = await runQuery(
      `INSERT INTO materias (nombre, codigo, profesor_id, descripcion) 
       VALUES (?, ?, ?, ?)`,
      [nombre, codigo, req.usuario.id, descripcion || '']
    );

    res.status(201).json({
      id: resultado.id,
      nombre,
      codigo,
      profesor_id: req.usuario.id,
      descripcion
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El código de materia ya existe' });
    }
    res.status(500).json({ error: 'Error al crear materia' });
  }
});

// Obtener materia por ID
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const materia = await getQuery('SELECT * FROM materias WHERE id = ?', [req.params.id]);
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materia' });
  }
});

// Actualizar materia (solo profesor dueño)
router.put('/:id', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar que el profesor es dueño
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [id, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta materia' });
    }

    await runQuery(
      'UPDATE materias SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, id]
    );

    res.json({ mensaje: 'Materia actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
});

// Inscribir estudiante en materia (solo profesor dueño)
router.post('/:materiaId/inscribir', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { materiaId } = req.params;
    const { estudianteId } = req.body;

    if (!estudianteId) {
      return res.status(400).json({ error: 'ID de estudiante requerido' });
    }

    // Verificar que el profesor es dueño
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [materiaId, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    // Verificar que es estudiante
    const estudiante = await getQuery('SELECT * FROM usuarios WHERE id = ? AND rol = "estudiante"', [estudianteId]);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Inscribir
    const resultado = await runQuery(
      'INSERT INTO inscripciones (estudiante_id, materia_id) VALUES (?, ?)',
      [estudianteId, materiaId]
    );

    res.status(201).json({ mensaje: 'Estudiante inscrito en la materia' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta materia' });
    }
    res.status(500).json({ error: 'Error al inscribir estudiante' });
  }
});

// Desinscribir estudiante
router.delete('/:materiaId/desinscribir/:estudianteId', verificarToken, verificarRol(['profesor']), async (req, res) => {
  try {
    const { materiaId, estudianteId } = req.params;

    // Verificar que el profesor es dueño
    const materia = await getQuery('SELECT * FROM materias WHERE id = ? AND profesor_id = ?', [materiaId, req.usuario.id]);
    if (!materia) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    await runQuery(
      'DELETE FROM inscripciones WHERE estudiante_id = ? AND materia_id = ?',
      [estudianteId, materiaId]
    );

    res.json({ mensaje: 'Estudiante desinscrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desinscribir estudiante' });
  }
});

export default router;
