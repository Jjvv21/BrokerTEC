import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyToken } from "./services/api";

// Importa los componentes
import TraderHome from "./pages/trader/Home";
import Wallet from "./pages/trader/Wallet";
import Portafolio from "./pages/trader/Portafolio";
import Seguridad from "./pages/trader/Seguridad";
import EmpresaDetalle from "./pages/trader/EmpresaDetalle";
import Operar from "./pages/trader/Operar";
import Login from "./features/auth/Login";
import Profile from "./features/profile/Profile";
import EditProfile from "./pages/trader/EditProfile";
import ChangePassword from "./pages/trader/ChangePassword";

// Componente para la página 404
function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Página No Encontrada</h1>
        <p className="text-gray-600 mb-6">La página que buscas no existe.</p>
        <button 
          onClick={() => navigate('/trader')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta de Login */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/trader" />} 
          />
          
          {/* Ruta del Perfil */}
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          
          {/* Rutas de edición de perfil */}
          <Route 
            path="/edit-profile" 
            element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/change-password" 
            element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />} 
          />
          
          {/* Rutas de Trader */}
          <Route 
            path="/trader" 
            element={isAuthenticated ? <TraderHome /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trader/wallet" 
            element={isAuthenticated ? <Wallet /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trader/portafolio" 
            element={isAuthenticated ? <Portafolio /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trader/seguridad" 
            element={isAuthenticated ? <Seguridad /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trader/empresa/:id" 
            element={isAuthenticated ? <EmpresaDetalle /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trader/operar/:id" 
            element={isAuthenticated ? <Operar /> : <Navigate to="/login" />} 
          />
          
          {/* Rutas por defecto */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/trader" : "/login"} />} 
          />
          
          {/* Ruta de error 404 para manejar rutas no encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;