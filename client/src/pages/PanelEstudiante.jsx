import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { estudianteAPI } from '../services/api';
import Navbar from '../components/Navbar';
import TareasEstudiante from '../components/TareasEstudiante';
import CalificacionesEstudiante from '../components/CalificacionesEstudiante';
import AsistenteIA from '../components/AsistenteIA';
import '../styles/Panel.css';

export default function PanelEstudiante() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState('inicio');
  const [materias, setMaterias] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [mat, tar, cal, prom] = await Promise.all([
        estudianteAPI.getMaterias(),
        estudianteAPI.getTareas(),
        estudianteAPI.getCalificaciones(),
        estudianteAPI.getPromedios(),
      ]);

      setMaterias(mat);
      setTareas(tar);
      setCalificaciones(cal);
      setPromedios(prom);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (cargando) {
    return <div className="loading">Cargando panel...</div>;
  }

  const tareasPendientes = tareas.filter((tarea) => !tarea.entregado);

  const promedioGeneral =
    promedios.length > 0
      ? (
          promedios.reduce(
            (sum, p) => sum + (Number(p.promedio) || 0),
            0
          ) / promedios.length
        ).toFixed(2)
      : 'N/A';

  return (
    <div className="panel-container">
      <Navbar usuario={usuario} onLogout={handleLogout} />

      <div className="panel-content">

        <aside className="sidebar">
          <nav className="menu">

            <button
              className={`menu-item ${
                seccion === 'inicio' ? 'active' : ''
              }`}
              onClick={() => setSeccion('inicio')}
            >
              📊 Inicio
            </button>

            <button
              className={`menu-item ${
                seccion === 'materias' ? 'active' : ''
              }`}
              onClick={() => setSeccion('materias')}
            >
              📚 Mis materias ({materias.length})
            </button>

            <button
              className={`menu-item ${
                seccion === 'tareas' ? 'active' : ''
              }`}
              onClick={() => setSeccion('tareas')}
            >
              ✅ Tareas ({tareasPendientes.length})
            </button>

            <button
              className={`menu-item ${
                seccion === 'calificaciones' ? 'active' : ''
              }`}
              onClick={() => setSeccion('calificaciones')}
            >
              📈 Calificaciones
            </button>

            <button
              className={`menu-item ${
                seccion === 'ia' ? 'active' : ''
              }`}
              onClick={() => setSeccion('ia')}
            >
              🤖 Asistente IA
            </button>

          </nav>
        </aside>

        <main className="main-content">

          {/* INICIO */}
          {seccion === 'inicio' && (
            <div className="inicio-section">

              <h2>👋 Bienvenido, {usuario?.nombre}</h2>

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <h4>Materias inscritas</h4>
                    <p className="stat-number">
                      {materias.length}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h4>Tareas pendientes</h4>
                    <p className="stat-number">
                      {tareasPendientes.length}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h4>Calificaciones</h4>
                    <p className="stat-number">
                      {calificaciones.length}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h4>Promedio general</h4>
                    <p className="stat-number">
                      {promedioGeneral}
                    </p>
                  </div>
                </div>

              </div>

              <div className="promedios-section">

                <h3>📊 Promedio por materia</h3>

                <div className="promedios-list">

                  {promedios.length > 0 ? (
                    promedios.map((p) => (
                      <div
                        key={p.id}
                        className="promedio-item"
                      >
                        <span>{p.nombre}</span>

                        <span className="promedio-valor">
                          {p.promedio
                            ? Number(p.promedio).toFixed(2)
                            : 'N/A'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-message">
                      Sin calificaciones aún
                    </p>
                  )}

                </div>

              </div>

              <AsistenteIA />

            </div>
          )}

          {/* MATERIAS */}
          {seccion === 'materias' && (
            <div className="section">

              <h2>📚 Mis Materias</h2>

              <div className="materias-grid">

                {materias.length > 0 ? (
                  materias.map((materia) => (
                    <div
                      key={materia.id}
                      className="materia-card"
                    >
                      <h3>{materia.nombre}</h3>

                      <p className="codigo">
                        Código: {materia.codigo}
                      </p>

                      <p className="descripcion">
                        {materia.descripcion}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">
                    No estás inscrito en materias
                  </p>
                )}

              </div>

            </div>
          )}

          {/* TAREAS */}
          {seccion === 'tareas' && (
            <TareasEstudiante
              tareas={tareas}
              onRefresh={cargarDatos}
            />
          )}

          {/* CALIFICACIONES */}
          {seccion === 'calificaciones' && (
            <CalificacionesEstudiante
              calificaciones={calificaciones}
            />
          )}

          {/* ASISTENTE IA */}
          {seccion === 'ia' && (
            <div className="section">

              <h2>🤖 Asistente IA</h2>

              <p>
                Pregúntame sobre tus tareas, materias,
                fechas de entrega o temas académicos.
              </p>

              <AsistenteIA />

            </div>
          )}

        </main>
      </div>
    </div>
  );
}