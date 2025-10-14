import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Empresa, Usuario } from "../../models/types";
import { empresasMock, usuariosMock } from "../../services/mock";

export default function Operar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [tipo, setTipo] = useState<"compra" | "venta">("compra");
  const [cantidad, setCantidad] = useState<number>(0);
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    // Buscar empresa seleccionada
    const encontrada = empresasMock.find((e) => e.id === id);
    if (!encontrada) {
      navigate("/trader");
      return;
    }
    setEmpresa(encontrada);

    // Cargar usuario actual
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const user = JSON.parse(stored);
      const fullUser = usuariosMock.find((u) => u.usuario === user.usuario);
      setUsuario(fullUser || null);
    }
  }, [id, navigate]);

  if (!empresa || !usuario) return null;

  const handleOperacion = () => {
    const precio = empresa.precioActual;
    const costo = cantidad * precio;

    if (cantidad <= 0) {
      setMensaje("⚠️ La cantidad debe ser mayor que cero.");
      return;
    }

    if (tipo === "compra") {
      // Validar saldo y disponibilidad
      if (usuario.wallet.saldo < costo) {
        setMensaje("❌ Saldo insuficiente.");
        return;
      }
      if (empresa.inventarioTesoreria < cantidad) {
        setMensaje("❌ No hay suficientes acciones disponibles.");
        return;
      }
      setMensaje(`✅ Compra simulada: ${cantidad} acciones por $${costo}.`);
    } else {
      // Venta: buscar si el usuario tiene la empresa
      const posicion = usuario.portafolio?.find(
        (p) => p.empresaId === empresa.id
      );
      if (!posicion || posicion.cantidad < cantidad) {
        setMensaje("❌ No tienes suficientes acciones para vender.");
        return;
      }
      setMensaje(`✅ Venta simulada: ${cantidad} acciones por $${costo}.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Operar con {empresa.nombre}
        </h1>

        <div className="space-y-3 text-gray-700 mb-6">
          <p>
            <strong>Precio actual:</strong> ${empresa.precioActual}
          </p>
          <p>
            <strong>Acciones disponibles (Tesorería):</strong>{" "}
            {empresa.inventarioTesoreria.toLocaleString()}
          </p>
          <p>
            <strong>Saldo actual:</strong> ${usuario.wallet.saldo.toLocaleString()}
          </p>
        </div>

        {/* Selector de operación */}
        <div className="flex justify-center gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="compra"
              checked={tipo === "compra"}
              onChange={() => setTipo("compra")}
            />
            Comprar
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="venta"
              checked={tipo === "venta"}
              onChange={() => setTipo("venta")}
            />
            Vender
          </label>
        </div>

        {/* Cantidad */}
        <div className="flex flex-col items-center mb-4">
          <label className="text-gray-700 mb-1 font-medium">
            Cantidad de acciones
          </label>
          <input
            type="number"
            min={1}
            className="border border-gray-300 rounded-md px-3 py-2 w-40 text-center"
            value={cantidad || ""}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        {/* Botón */}
        <div className="text-center">
          <button
            onClick={handleOperacion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
          >
            Confirmar operación
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <p
            className={`mt-4 text-center font-medium ${
              mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
