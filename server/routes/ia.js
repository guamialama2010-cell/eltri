import express from 'express';
import OpenAI from 'openai';
import { allQuery } from '../db.js';
import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/asistente',
  verificarToken,
  verificarRol(['estudiante']),
  async (req, res) => {
    try {
      const { pregunta } = req.body;

      if (!pregunta || !pregunta.trim()) {
        return res.status(400).json({
          error: 'Escribe un mensaje'
        });
      }

      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const estudianteId = req.usuario.id;

      const tareas = await allQuery(
        `
        SELECT
          t.id,
          t.titulo,
          t.descripcion,
          t.instrucciones,
          t.fecha_entrega,
          m.nombre AS materia
        FROM tareas t
        INNER JOIN materias m
          ON t.materia_id = m.id
        INNER JOIN inscripciones i
          ON i.materia_id = m.id
        WHERE i.estudiante_id = ?
        ORDER BY t.fecha_entrega ASC
        `,
        [estudianteId]
      );

      const ahora = new Date();

      const tareasPendientes = tareas.filter((tarea) => {
        return new Date(tarea.fecha_entrega) >= ahora;
      });

      const resumenTareas = tareasPendientes.map((tarea) => ({
        materia: tarea.materia,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        instrucciones: tarea.instrucciones,
        fecha_entrega: tarea.fecha_entrega
      }));

      const respuesta = await client.responses.create({
        model: 'gpt-5-mini',

        instructions: `
Eres el asistente académico de una plataforma escolar.

Ayudas a los estudiantes de manera clara, amable y sencilla.

Puedes:
- Informar cuántas tareas pendientes tienen.
- Decir qué tareas tienen.
- Indicar la materia de cada tarea.
- Indicar las fechas de entrega.
- Ayudar a organizar las tareas.
- Explicar instrucciones de las tareas.
- Ayudar a estudiar.
- Explicar temas académicos.

No inventes tareas, fechas ni calificaciones.
Cuando hables de las tareas del estudiante,
utiliza únicamente los datos proporcionados.

Si el estudiante pregunta algo académico,
ayúdalo de forma clara y paso a paso.
        `,

        input: `
TAREAS PENDIENTES DEL ESTUDIANTE:

${JSON.stringify(resumenTareas, null, 2)}

MENSAJE DEL ESTUDIANTE:

${pregunta}
        `
      });

      res.json({
        respuesta: respuesta.output_text,
        tareasPendientes: tareasPendientes.length
      });

    } catch (error) {
      console.error('Error en IA:', error);

      res.status(500).json({
        error: 'No se pudo conectar con el asistente de IA'
      });
    }
  }
);

export default router;