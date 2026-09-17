import { useState } from 'react';
import '../styles/Modal.css';

export default function CrearMateria({ onCrear, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await onCrear({
        nombre,
        codigo,
        descripcion,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onCancel}>
          ✕
        </button>

        <h3>Crear nueva materia</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la materia</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Matemáticas"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="codigo">Código</label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: MAT101"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la materia"
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Creando...' : 'Crear materia'}
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
