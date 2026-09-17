import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [grado, setGrado] = useState('');
  const [curso, setCurso] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const datos = {
        nombre,
        correo,
        contraseña,
        rol,
        ...(rol === 'estudiante' && { grado, curso }),
      };

      const respuesta = await authAPI.register(datos);
      login(respuesta.usuario, respuesta.token);

      if (respuesta.usuario.rol === 'estudiante') {
        navigate('/estudiante');
      } else if (respuesta.usuario.rol === 'profesor') {
        navigate('/profesor');
      }
    } catch (err) {
      setError(err.message || 'Error en el registro');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo">🎓</div>
          <h1>ELTRI</h1>
          <p className="tagline">La educación, ahora más inteligente</p>
        </div>

        <h2>Crear cuenta</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraseña">Contraseña</label>
            <input
              id="contraseña"
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="Contraseña segura"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol">¿Qué eres?</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
            </select>
          </div>

          {rol === 'estudiante' && (
            <>
              <div className="form-group">
                <label htmlFor="grado">Grado</label>
                <input
                  id="grado"
                  type="text"
                  value={grado}
                  onChange={(e) => setGrado(e.target.value)}
                  placeholder="Ej: 10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="curso">Curso/Grupo</label>
                <input
                  id="curso"
                  type="text"
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  placeholder="Ej: 10A"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
