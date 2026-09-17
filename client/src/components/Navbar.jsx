import '../styles/Navbar.css';

export default function Navbar({ usuario, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">ELTRI</span>
        </div>

        <div className="navbar-info">
          <span className="usuario-rol">
            {usuario?.rol === 'estudiante' ? '👨‍🎓' : '👨‍🏫'} {usuario?.nombre}
          </span>
          <button className="btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
