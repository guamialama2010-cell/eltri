import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Login() {
  const [correo, setCorreo] = useState('estudiante@eltri.com');
  const [contraseña, setContraseña] = useState('estudiante123');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await authAPI.login({ correo, contraseña });
      login(respuesta.usuario, respuesta.token);

      // Redirigir según rol
      if (respuesta.usuario.rol === 'estudiante') {
        navigate('/estudiante');
      } else if (respuesta.usuario.rol === 'profesor') {
        navigate('/profesor');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
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

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Contraseña"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="demo-info">
          <h4>📝 Datos de prueba:</h4>
          <p><strong>Estudiante:</strong> estudiante@eltri.com / estudiante123</p>
          <p><strong>Profesor:</strong> profesor@eltri.com / profesor123</p>
        </div>

        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}
