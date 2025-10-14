import { useEffect, useState } from "react";
import type { Usuario } from "../../models/types";
import { usuariosMock } from "../../services/mock";

export default function Seguridad() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [contrasena, setContrasena] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const user = JSON.parse(stored);
      const fullUser = usuariosMock.find((u) => u.usuario === user.usuario);
      setUsuario(fullUser || null);
    }
  }, []);

  if (!usuario) return null;

  const handleLiquidar = () => {
    if (contrasena.trim() === "") {
      setMensaje("⚠️ Debes ingresar tu contraseña para confirmar.");
      return;
    }

    if (contrasena !== usuario.contrasena) {
      setMensaje("❌ Contraseña incorrecta.");
      return;
    }

    // Simular liquidación (solo mensaje visual)
    setMensaje("✅ Todas tus posiciones fueron liquidadas exitosamente (simulado).");
    setContrasena("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Seguridad de la cuenta
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Esta sección contiene acciones críticas relacionadas con tu cuenta y tus posiciones.
        </p>

        {/* Bloque de liquidación */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 text-center">
            Liquidar todas las posiciones
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            Esta acción venderá todas tus acciones al precio actual.
            Por seguridad, debes confirmar con tu contraseña.
          </p>

          <div className="flex flex-col items-center gap-3">
            <input
              type="password"
              placeholder="Contraseña"
              className="border border-gray-300 rounded-md px-3 py-2 w-60 text-center"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />

            <button
              onClick={handleLiquidar}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-medium"
            >
              Liquidar todo
            </button>

            {mensaje && (
              <p
                className={`mt-3 text-center font-medium ${
                  mensaje.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {mensaje}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
