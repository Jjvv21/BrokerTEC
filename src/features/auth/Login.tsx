import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api"; // ← Cambiar por API real

export default function Login() {
  const [email, setEmail] = useState(""); // ← Cambiar usuario por email
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const savedUser = localStorage.getItem("usuario");
  const savedToken = localStorage.getItem("authToken");
  
  if (savedUser && savedToken) {
    const user = JSON.parse(savedUser);
    
    // ✅ CONVERTIR rolId A STRING
    const role = user.rolId === 1 ? 'admin' : 
                 user.rolId === 2 ? 'trader' : 'analyst';
    
    navigate(`/${role}`);
  }
}, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // ✅ LLAMADA AL BACKEND REAL
      const result = await login(email, contrasena);
      
      // Guardar token y usuario
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.user));
      
      // Navegar según el rol (adaptar según tu backend)
      const role = result.user.rolId === 1 ? 'admin' : 
                   result.user.rolId === 2 ? 'trader' : 'analyst';
      navigate(`/${role}`);
      
    } catch (err: any) {
      setError(err.response?.data?.error || "Error de conexión");
    } finally {
      setCargando(false);
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
            type="email" // ← Cambiar a email
            placeholder="Email" // ← Cambiar placeholder
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition-all"
          >
            {cargando ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-center mt-4 font-medium">
            {error}
          </p>
        )}

        {/* DATOS DE PRUEBA */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
          <p className="font-semibold">Datos de prueba:</p>
          <p>Email: trader1@test.com</p>
          <p>Contraseña: hash_trader1</p>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          © 2025 BrokerTEC — Acceso restringido
        </p>
      </div>
    </div>
  );
}