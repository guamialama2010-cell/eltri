import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelEstudiante from './pages/PanelEstudiante';
import PanelProfesor from './pages/PanelProfesor';
import './App.css';

function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route
            path="/estudiante/*"
            element={
              <ProtectedRoute>
                <PanelEstudiante />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profesor/*"
            element={
              <ProtectedRoute>
                <PanelProfesor />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
