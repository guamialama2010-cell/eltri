import { useState } from 'react';
import "../styles/AsistenteIA.css";

const API_URL = 'https://eltri-va03.onrender.com';

export default function AsistenteIA({ tareas = [], materias = [], calificaciones = [] }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);

  const preguntarIA = async (texto = pregunta) => {
    if (!texto.trim()) return;

    setCargando(true);
    setRespuesta('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/ia/asistente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pregunta: texto,
          tareas,
          materias,
          calificaciones,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al consultar la IA');
      }

      setRespuesta(data.respuesta);
    } catch (error) {
      console.error('Error IA:', error);
      setRespuesta('No pude conectarme con el asistente. Revisa que el servidor esté funcionando.');
    } finally {
      setCargando(false);
    }
  };

  const tareasPendientes = tareas.filter(t => !t.entregado);

  return (
    <div className="asistente-ia">
      <div className="ia-header">
        <div>
          <span className="ia-icon">🤖</span>
          <h2>Asistente IA</h2>
        </div>
        <span className="ia-status">● En línea</span>
      </div>

      <div className="ia-resumen">
        <div className="ia-resumen-card">
          <strong>{tareasPendientes.length}</strong>
          <span>Tareas pendientes</span>
        </div>

        <div className="ia-resumen-card">
          <strong>{materias.length}</strong>
          <span>Materias</span>
        </div>

        <div className="ia-resumen-card">
          <strong>{calificaciones.length}</strong>
          <span>Calificaciones</span>
        </div>
      </div>

      {tareasPendientes.length > 0 && (
        <div className="ia-aviso">
          <strong>👋 ¡Hola!</strong>
          <p>
            Tienes <strong>{tareasPendientes.length}</strong> tarea
            {tareasPendientes.length !== 1 ? 's' : ''} pendiente
            {tareasPendientes.length !== 1 ? 's' : ''}.
          </p>

          <button
            onClick={() =>
              preguntarIA(
                'Tengo tareas pendientes. Dime cuáles tengo, de qué materia son y cuál debería revisar primero.'
              )
            }
          >
            📚 Ayúdame con mis tareas
          </button>
        </div>
      )}

      <div className="ia-sugerencias">
        <p>Preguntas rápidas:</p>

        <button
          onClick={() =>
            preguntarIA('¿Cuántas tareas pendientes tengo y de qué materias son?')
          }
        >
          📋 Mis tareas pendientes
        </button>

        <button
          onClick={() =>
            preguntarIA('¿Cómo voy con mis calificaciones?')
          }
        >
          📊 ¿Cómo voy?
        </button>

        <button
          onClick={() =>
            preguntarIA('Ayúdame a organizar mis tareas pendientes.')
          }
        >
          🗓️ Organizar tareas
        </button>
      </div>

      <div className="ia-chat">
        <textarea
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe tu pregunta..."
          rows="3"
          disabled={cargando}
        />

        <button
          className="ia-btn"
          onClick={() => preguntarIA()}
          disabled={cargando || !pregunta.trim()}
        >
          {cargando ? '🤔 Pensando...' : '✨ Preguntar'}
        </button>
      </div>

      {respuesta && (
        <div className="ia-respuesta">
          <div className="ia-respuesta-titulo">
            🤖 Asistente
          </div>

          <div className="ia-respuesta-texto">
            {respuesta}
          </div>
        </div>
      )}
    </div>
  );
}