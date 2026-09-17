import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profesorAPI, materiasAPI, tareasAPI } from '../services/api';
import Navbar from '../components/Navbar';
import CrearMateria from '../components/CrearMateria';
import CrearTarea from '../components/CrearTarea';
import '../styles/Panel.css';

export default function PanelProfesor() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState('inicio');
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [promedios, setPromedios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [mostrarCrearMateria, setMostrarCrearMateria] = useState(false);
  const [mostrarCrearTarea, setMostrarCrearTarea] = useState(false);

  // =========================
  // CARGAR MATERIAS
  // =========================

  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    try {
      const mat = await profesorAPI.getMaterias();
      setMaterias(mat);
    } catch (error) {
      console.error('Error cargando materias:', error);
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // SELECCIONAR MATERIA
  // =========================

  const cargarDetalleMateria = async (materiaId) => {
    // IMPORTANTE:
    // Seleccionamos primero la materia.
    // Así se habilitan Estudiantes, Tareas y Calificaciones
    // aunque alguna petición falle.
    setMateriaSeleccionada(materiaId);

    // Cargar estudiantes
    try {
      const est = await profesorAPI.getEstudiantes(materiaId);
      setEstudiantes(est);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setEstudiantes([]);
    }

    // Cargar promedios
    try {
      const prom = await profesorAPI.getPromedios(materiaId);
      setPromedios(prom);
    } catch (error) {
      console.error('Error cargando promedios:', error);
      setPromedios([]);
    }

    // Cargar tareas
    try {
      const tar = await profesorAPI.getTareas(materiaId);
      setTareas(tar);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      setTareas([]);
    }
  };

  // =========================
  // CERRAR SESIÓN
  // =========================

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // =========================
  // CREAR MATERIA
  // =========================

  const handleCrearMateria = async (datos) => {
    try {
      await materiasAPI.crear(datos);

      setMostrarCrearMateria(false);

      await cargarMaterias();
    } catch (error) {
      console.error('Error creando materia:', error);
    }
  };

  // =========================
  // CREAR TAREA
  // =========================

  const handleCrearTarea = async (datos) => {
    try {
      await tareasAPI.crear(datos);

      // Volver a cargar las tareas de la materia seleccionada
      if (materiaSeleccionada) {
        const nuevasTareas = await profesorAPI.getTareas(
          materiaSeleccionada
        );

        setTareas(nuevasTareas);
      }

      setMostrarCrearTarea(false);
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw error;
    }
  };

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return <div className="loading">Cargando panel...</div>;
  }

  // =========================
  // PANEL
  // =========================

  return (
    <div className="panel-container">

      <Navbar
        usuario={usuario}
        onLogout={handleLogout}
      />

      <div className="panel-content">

        {/* =========================
            MENÚ LATERAL
        ========================= */}

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
              📚 Mis Materias ({materias.length})
            </button>

            <button
              className={`menu-item ${
                seccion === 'estudiantes' ? 'active' : ''
              }`}
              onClick={() => setSeccion('estudiantes')}
              disabled={!materiaSeleccionada}
            >
              👥 Estudiantes
            </button>

            <button
              className={`menu-item ${
                seccion === 'tareas' ? 'active' : ''
              }`}
              onClick={() => setSeccion('tareas')}
              disabled={!materiaSeleccionada}
            >
              ✅ Tareas
            </button>

            <button
              className={`menu-item ${
                seccion === 'calificaciones' ? 'active' : ''
              }`}
              onClick={() => setSeccion('calificaciones')}
              disabled={!materiaSeleccionada}
            >
              📈 Calificaciones
            </button>

          </nav>

        </aside>

        {/* =========================
            CONTENIDO PRINCIPAL
        ========================= */}

        <main className="main-content">

          {/* =========================
              INICIO
          ========================= */}

          {seccion === 'inicio' && (
            <div className="inicio-section">

              <h2>
                👋 Bienvenido, Prof. {usuario?.nombre}
              </h2>

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon">
                    📚
                  </div>

                  <div className="stat-info">
                    <h4>Materias</h4>
                    <p className="stat-number">
                      {materias.length}
                    </p>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    👥
                  </div>

                  <div className="stat-info">
                    <h4>Estudiantes totales</h4>

                    <p className="stat-number">
                      {materias.reduce(
                        (sum, m) =>
                          sum + (m.estudiantes || 0),
                        0
                      )}
                    </p>

                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    ✅
                  </div>

                  <div className="stat-info">

                    <h4>
                      Tareas creadas
                    </h4>

                    <p className="stat-number">
                      {tareas.length}
                    </p>

                  </div>

                </div>

              </div>

              <button
                className="btn-primary"
                onClick={() =>
                  setMostrarCrearMateria(true)
                }
              >
                ➕ Crear nueva materia
              </button>

              {mostrarCrearMateria && (
                <CrearMateria
                  onCrear={handleCrearMateria}
                  onCancel={() =>
                    setMostrarCrearMateria(false)
                  }
                />
              )}

            </div>
          )}

          {/* =========================
              MATERIAS
          ========================= */}

          {seccion === 'materias' && (
            <div className="section">

              <h2>
                📚 Mis Materias
              </h2>

              {materiaSeleccionada && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px',
                    background: '#e8f5e9',
                    borderRadius: '8px'
                  }}
                >
                  <strong>
                    Materia seleccionada:
                  </strong>{' '}
                  {materias.find(
                    (m) =>
                      m.id === materiaSeleccionada
                  )?.nombre || 'Materia'}
                </div>
              )}

              <div className="materias-grid">

                {materias.length > 0 ? (

                  materias.map((materia) => (

                    <div
                      key={materia.id}
                      className={`materia-card ${
                        materiaSeleccionada === materia.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        cargarDetalleMateria(
                          materia.id
                        )
                      }
                    >

                      <h3>
                        {materia.nombre}
                      </h3>

                      <p className="codigo">
                        Código: {materia.codigo}
                      </p>

                      <p className="descripcion">
                        {materia.descripcion}
                      </p>

                      <p className="click-hint">
                        👆 Haz clic para seleccionar
                      </p>

                      {materiaSeleccionada ===
                        materia.id && (
                        <p
                          style={{
                            color: '#198754',
                            fontWeight: 'bold'
                          }}
                        >
                          ✓ Materia seleccionada
                        </p>
                      )}

                    </div>

                  ))

                ) : (

                  <p className="empty-message">
                    No tienes materias. Crea una.
                  </p>

                )}

              </div>

            </div>
          )}

          {/* =========================
              ESTUDIANTES
          ========================= */}

          {seccion === 'estudiantes' &&
            materiaSeleccionada && (

            <div className="section">

              <h2>
                👥 Estudiantes inscritos
              </h2>

              <div className="tabla-container">

                <table className="tabla">

                  <thead>

                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Grado</th>
                      <th>Curso</th>
                    </tr>

                  </thead>

                  <tbody>

                    {estudiantes.length > 0 ? (

                      estudiantes.map((est) => (

                        <tr key={est.id}>

                          <td>
                            {est.nombre}
                          </td>

                          <td>
                            {est.correo}
                          </td>

                          <td>
                            {est.grado || '-'}
                          </td>

                          <td>
                            {est.curso || '-'}
                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan="4"
                          className="empty-message"
                        >
                          No hay estudiantes inscritos
                          en esta materia.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* =========================
              TAREAS
          ========================= */}

          {seccion === 'tareas' &&
            materiaSeleccionada && (

            <div className="section">

              <h2>
                ✅ Tareas de la materia
              </h2>

              <button
                className="btn-primary"
                onClick={() =>
                  setMostrarCrearTarea(true)
                }
              >
                ➕ Crear tarea
              </button>

              {mostrarCrearTarea && (
                <CrearTarea
                  materiaId={materiaSeleccionada}
                  onCrear={handleCrearTarea}
                  onCancel={() =>
                    setMostrarCrearTarea(false)
                  }
                />
              )}

              <div
                style={{
                  marginTop: '25px'
                }}
              >

                {tareas.length > 0 ? (

                  tareas.map((tarea) => (

                    <div
                      key={tarea.id}
                      className="stat-card"
                      style={{
                        marginBottom: '15px'
                      }}
                    >

                      <div className="stat-info">

                        <h3>
                          {tarea.titulo}
                        </h3>

                        <p>
                          {tarea.descripcion}
                        </p>

                        {tarea.instrucciones && (
                          <p>
                            <strong>
                              Instrucciones:
                            </strong>{' '}
                            {tarea.instrucciones}
                          </p>
                        )}

                        <p>
                          <strong>
                            Fecha de entrega:
                          </strong>{' '}
                          {tarea.fecha_entrega}
                        </p>

                      </div>

                    </div>

                  ))

                ) : (

                  <p className="empty-message">
                    No hay tareas creadas para esta
                    materia todavía.
                  </p>

                )}

              </div>

            </div>

          )}

          {/* =========================
              CALIFICACIONES
          ========================= */}

          {seccion === 'calificaciones' &&
            materiaSeleccionada && (

            <div className="section">

              <h2>
                📈 Promedios de estudiantes
              </h2>

              <div className="tabla-container">

                <table className="tabla">

                  <thead>

                    <tr>
                      <th>Estudiante</th>
                      <th>Promedio</th>
                      <th>Calificaciones</th>
                    </tr>

                  </thead>

                  <tbody>

                    {promedios.length > 0 ? (

                      promedios.map((prom) => (

                        <tr key={prom.id}>

                          <td>
                            {prom.nombre}
                          </td>

                          <td className="valor-importante">
                            {prom.promedio != null
                              ? Number(
                                  prom.promedio
                                ).toFixed(2)
                              : 'N/A'}
                          </td>

                          <td>
                            {prom.total_calificaciones ||
                              0}
                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan="3"
                          className="empty-message"
                        >
                          No hay calificaciones para
                          esta materia todavía.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}