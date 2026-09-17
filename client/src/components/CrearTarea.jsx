import { useState } from 'react';
import '../styles/Modal.css';

export default function CrearTarea({ materiaId, onCrear, onCancel }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await onCrear({
        materia_id: materiaId,
        titulo,
        descripcion,
        instrucciones,
        fecha_entrega: fechaEntrega,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onCancel}>
          ✕
        </button>

        <h3>Crear nueva tarea</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título de la tarea</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Ejercicios de álgebra"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la tarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instrucciones">Instrucciones</label>
            <textarea
              id="instrucciones"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Instrucciones detalladas para resolver la tarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaEntrega">Fecha de entrega</label>
            <input
              id="fechaEntrega"
              type="datetime-local"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              min={hoy}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Creando...' : 'Crear tarea'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
