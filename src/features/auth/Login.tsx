import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usuariosMock } from "../../services/mock";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      navigate(`/${user.rol.toLowerCase()}`);
    }
  }, [navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = usuariosMock.find(
      (u) =>
        u.usuario.toLowerCase() === usuario.toLowerCase() &&
        u.contrasena === contrasena
    );

    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
      navigate(`/${user.rol.toLowerCase()}`);
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-xl px-10 py-8 w-[22rem]">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuario"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
          >
            Entrar
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-center mt-4 font-medium">
            {error}
          </p>
        )}

        <p className="text-gray-500 text-xs text-center mt-6">
          © 2025 BrokerTEC — Acceso restringido
        </p>
      </div>
    </div>
  );
}
