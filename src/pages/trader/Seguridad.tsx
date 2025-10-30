import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { liquidateAll, getUserProfile } from "../../services/api";

interface UsuarioReal {
  id_usuario: number;
  alias: string;
  nombre: string;
  correo: string;
  id_rol: number;
  estado: boolean;
}

export default function Seguridad() {
  const [usuario, setUsuario] = useState<UsuarioReal | null>(null);
  const [contrasena, setContrasena] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [liquidando, setLiquidando] = useState(false);
  const navigate = useNavigate();

  // ✅ Cargar datos REALES del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🔄 Cargando datos del usuario para seguridad...');
        const userData = await getUserProfile();
        console.log('✅ Usuario real recibido:', userData);
        setUsuario(userData);
      } catch (err) {
        console.error('❌ Error cargando datos de usuario:', err);
        setMensaje("Error al cargar los datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ✅ Liquidación REAL con el backend
  const handleLiquidar = async () => {
    if (contrasena.trim() === "") {
      setMensaje("⚠️ Debes ingresar tu contraseña para confirmar.");
      return;
    }

    setLiquidando(true);
    setMensaje("🔄 Procesando liquidación...");

    try {
      console.log('🔄 Iniciando liquidación total...');
      const resultado = await liquidateAll(contrasena);
      console.log('✅ Liquidación exitosa:', resultado);
      
      setMensaje(`✅ ${resultado.message} - Total liquidado: $${resultado.totalLiquidated?.toLocaleString() || '0'}`);
      setContrasena("");
      
      // Redirigir al portafolio después de 3 segundos
      setTimeout(() => {
        navigate("/trader/portafolio");
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Error en liquidación:', error);
      setMensaje(`❌ ${error.response?.data?.error || error.message || "Error al procesar la liquidación"}`);
    } finally {
      setLiquidando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de seguridad...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">No se pudieron cargar los datos del usuario</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Seguridad de la cuenta
          </h1>
          <p className="text-gray-600">
            Usuario: <span className="font-semibold text-blue-600">{usuario.alias}</span>
          </p>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          Esta sección contiene acciones críticas relacionadas con tu cuenta y tus posiciones.
        </p>

        {/* Bloque de liquidación */}
        <div className="border-t pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-red-800 text-center mb-2">
              ⚠️ Liquidar todas las posiciones
            </h2>
            <p className="text-red-700 text-sm text-center">
              Esta acción venderá <strong>TODAS</strong> tus acciones al precio actual de mercado.
              Esta operación es <strong>IRREVERSIBLE</strong>.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Confirmar con contraseña
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña para confirmar"
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                disabled={liquidando}
              />
            </div>

            <button
              onClick={handleLiquidar}
              disabled={liquidando || contrasena.trim() === ""}
              className={`${
                liquidando ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              } text-white px-8 py-3 rounded-lg transition-all font-medium disabled:opacity-50`}
            >
              {liquidando ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Liquidando...
                </div>
              ) : (
                '⚠️ Liquidar Todo'
              )}
            </button>

            {mensaje && (
              <div className={`mt-3 p-3 rounded-lg text-center font-medium w-full ${
                mensaje.startsWith("✅") 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : mensaje.startsWith("🔄")
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {mensaje}
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3 text-center">
            ¿Qué pasa cuando liquidas?
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Todas tus posiciones se venden al precio actual de mercado
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              El dinero resultante se acredita a tu wallet
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              La operación se registra en el historial de transacciones
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              Esta acción no se puede deshacer
            </li>
          </ul>
        </div>

        {/* Botón de volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/trader/portafolio")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver al Portafolio
          </button>
        </div>
      </div>
    </div>
  );
}