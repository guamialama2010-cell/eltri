import '../styles/Calificaciones.css';

export default function CalificacionesEstudiante({ calificaciones }) {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const obtenerColor = (nota) => {
    if (nota >= 4.5) return '#2ecc71';
    if (nota >= 3.5) return '#f39c12';
    return '#e74c3c';
  };

  // Agrupar calificaciones por materia
  const materias = {};

  calificaciones.forEach((cal) => {
    if (!materias[cal.materia_id]) {
      materias[cal.materia_id] = {
        nombre: cal.materia_nombre,
        notas: [],
      };
    }

    materias[cal.materia_id].notas.push(Number(cal.calificacion));
  });

  // Calcular promedio y proyecciones
  const proyecciones = Object.values(materias).map((materia) => {
    const suma = materia.notas.reduce((total, nota) => total + nota, 0);
    const cantidad = materia.notas.length;
    const promedio = suma / cantidad;

    const calcularProyeccion = (nuevaNota) => {
      return (suma + nuevaNota) / (cantidad + 1);
    };

    return {
      ...materia,
      promedio,
      proyecciones: {
        tres: calcularProyeccion(3),
        cuatro: calcularProyeccion(4),
        cinco: calcularProyeccion(5),
      },
    };
  });

  return (
    <div className="section">
      <h2>📊 Mis Calificaciones</h2>

      {calificaciones.length > 0 ? (
        <>
          <div className="proyecciones-section">
            <h3>📈 Proyección de calificaciones</h3>

            <p className="proyeccion-descripcion">
              Mira cómo podría cambiar tu promedio si obtienes diferentes
              calificaciones en tu próxima evaluación.
            </p>

            <div className="proyecciones-list">
              {proyecciones.map((materia) => (
                <div
                  key={materia.nombre}
                  className="proyeccion-card"
                >
                  <h4>{materia.nombre}</h4>

                  <p>
                    Promedio actual:{' '}
                    <strong>{materia.promedio.toFixed(2)}</strong>
                  </p>

                  <div className="proyeccion-resultados">
                    <div>
                      <span>Si sacas 3.0</span>
                      <strong>
                        {materia.proyecciones.tres.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Si sacas 4.0</span>
                      <strong>
                        {materia.proyecciones.cuatro.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Si sacas 5.0</span>
                      <strong>
                        {materia.proyecciones.cinco.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h3>📝 Historial de calificaciones</h3>

          <div className="calificaciones-container">
            {calificaciones.map((cal) => (
              <div key={cal.id} className="calificacion-card">
                <div className="calificacion-header">
                  <h4>{cal.tarea_titulo || cal.materia_nombre}</h4>

                  <div
                    className="nota-circulo"
                    style={{
                      borderColor: obtenerColor(cal.calificacion),
                    }}
                  >
                    <span
                      className="nota"
                      style={{
                        color: obtenerColor(cal.calificacion),
                      }}
                    >
                      {cal.calificacion?.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="materia">
                  {cal.materia_nombre}
                </p>

                <p className="fecha">
                  Fecha: {formatearFecha(cal.fecha_calificacion)}
                </p>

                {cal.comentario_profesor && (
                  <div className="comentario">
                    <p className="comentario-label">
                      💬 Comentario del profesor:
                    </p>
                    <p>{cal.comentario_profesor}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="empty-message">
          No tienes calificaciones aún.
        </p>
      )}
    </div>
  );
}