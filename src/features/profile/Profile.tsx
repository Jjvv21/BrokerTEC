import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../../models/types";
import { usuariosMock } from "../../services/mock";

export default function Profile() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const user = JSON.parse(stored);
      const fullUser = usuariosMock.find((u) => u.usuario === user.usuario);
      setUsuario(fullUser || null);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      <div className="bg-white shadow-md rounded-xl p-8 w-[26rem]">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Perfil de Usuario
        </h1>

        <div className="space-y-3 text-gray-700">
          <p><strong>Usuario:</strong> {usuario.usuario}</p>
          <p><strong>Alias:</strong> {usuario.alias}</p>
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono}</p>
          {usuario.direccion && (
            <p><strong>Dirección:</strong> {usuario.direccion}</p>
          )}
          <p><strong>País:</strong> {usuario.pais}</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
          <p><strong>Estado:</strong> {usuario.estado}</p>
        </div>

        {/* 🔹 Info de Wallet (solo si existe) */}
        {usuario.wallet && (
          <div className="mt-8 border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Información de Wallet
            </h2>
            <p><strong>Saldo:</strong> ${usuario.wallet.saldo.toLocaleString()}</p>
            <p><strong>Categoría:</strong> {usuario.wallet.categoria}</p>
            <p><strong>Límite diario:</strong> ${usuario.wallet.limiteDiario.toLocaleString()}</p>
            <p><strong>Consumo hoy:</strong> ${usuario.wallet.consumoHoy.toLocaleString()}</p>
          </div>
        )}

        {/* 🔸 Botón Seguridad (solo para Trader) */}
        {usuario.rol === "Trader" && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/trader/seguridad")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-medium"
            >
              Seguridad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
