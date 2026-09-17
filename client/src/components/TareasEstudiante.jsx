import { useState } from 'react';
import { tareasAPI } from '../services/api';
import '../styles/Tareas.css';

export default function TareasEstudiante({ tareas, onRefresh }) {
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleEntregar = async (tareaId) => {
    if (!comentario.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    setCargando(true);
    try {
      await tareasAPI.entregar(tareaId, {
        comentario_estudiante: comentario,
        archivo_nombre: 'archivo_entregado.pdf',
      });
      alert('Tarea entregada correctamente');
      setComentario('');
      setTareaSeleccionada(null);
      onRefresh();
    } catch (error) {
      alert('Error al entregar: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estaVencida = (fecha) => new Date(fecha) < new Date();

  return (
    <div className="section">
      <h2>✅ Mis Tareas</h2>

      {tareaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setTareaSeleccionada(null)}>
              ✕
            </button>

            <h3>{tareaSeleccionada.titulo}</h3>
            <p className="materia-info">{tareaSeleccionada.materia_nombre}</p>

            <div className="tarea-detalle">
              <p>
                <strong>Profesor:</strong> {tareaSeleccionada.profesor_nombre}
              </p>
              <p>
                <strong>Fecha de entrega:</strong> {formatearFecha(tareaSeleccionada.fecha_entrega)}
              </p>

              {tareaSeleccionada.instrucciones && (
                <div className="instrucciones">
                  <h4>Instrucciones:</h4>
                  <p>{tareaSeleccionada.instrucciones}</p>
                </div>
              )}

              <div className="form-group">
                <label>Comentario (opcional):</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe un comentario sobre tu tarea..."
                  rows="4"
                />
              </div>

              <button
                className="btn-primary"
                onClick={() => handleEntregar(tareaSeleccionada.id)}
                disabled={cargando}
              >
                {cargando ? 'Entregando...' : 'Entregar tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tareas-list">
        {tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div
              key={tarea.id}
              className={`tarea-item ${tarea.entregado ? 'entregado' : ''} ${
                estaVencida(tarea.fecha_entrega) ? 'vencido' : ''
              }`}
            >
              <div className="tarea-header">
                <h3>{tarea.titulo}</h3>
                <span className={`badge ${tarea.entregado ? 'entregado' : 'pendiente'}`}>
                  {tarea.entregado ? '✓ Entregado' : '⏰ Pendiente'}
                </span>
              </div>

              <p className="materia">{tarea.materia_nombre}</p>

              <div className="tarea-info">
                <span className="fecha">
                  📅 {formatearFecha(tarea.fecha_entrega)}
                </span>
                {estaVencida(tarea.fecha_entrega) && !tarea.entregado && (
                  <span className="vencida">⚠️ VENCIDA</span>
                )}
              </div>

              {tarea.descripcion && (
                <p className="descripcion">{tarea.descripcion}</p>
              )}

              <button
                className="btn-secondary"
                onClick={() => setTareaSeleccionada(tarea)}
                disabled={tarea.entregado}
              >
                {tarea.entregado ? '✓ Entregada' : 'Entregar'}
              </button>
            </div>
          ))
        ) : (
          <p className="empty-message">No tienes tareas asignadas</p>
        )}
      </div>
    </div>
  );
}
