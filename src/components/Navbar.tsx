import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!user) return null;

  function handleLogout() {
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  function handleHomeRedirect() {
    navigate(`/${user.rol.toLowerCase()}`);
  }

  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white px-8 py-3 shadow-md">
      {/* 🔹 Logo con acción */}
      <button
        onClick={handleHomeRedirect}
        className="text-lg font-bold hover:text-blue-400 transition-colors"
      >
        BrokerTEC
      </button>

      <div className="flex items-center gap-6">
        <a
          href="/perfil"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Perfil
        </a>

        <span className="text-white">
          {user.nombre}{" "}
          <span className="text-gray-400">({user.rol})</span>
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-white font-medium transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
