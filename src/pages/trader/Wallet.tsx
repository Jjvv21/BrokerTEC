import { useEffect, useState } from "react";
import type { Usuario } from "../../models/types";
import { usuariosMock } from "../../services/mock";

export default function Wallet() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [monto, setMonto] = useState<number>(0);
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

  const handleRecarga = () => {
    if (monto <= 0) {
      setMensaje("⚠️ Ingrese un monto válido.");
      return;
    }

    const wallet = usuario.wallet;
    const nuevoConsumo = wallet.consumoHoy + monto;

    if (nuevoConsumo > wallet.limiteDiario) {
      const restante = wallet.limiteDiario - wallet.consumoHoy;
      setMensaje(`❌ Límite diario alcanzado. Solo puede recargar $${restante}.`);
      return;
    }

    // Simular recarga (sin persistir todavía)
    wallet.saldo += monto;
    wallet.consumoHoy = nuevoConsumo;
    wallet.historialRecargas.unshift({
      id: "r" + (wallet.historialRecargas.length + 1),
      monto,
      fecha: new Date().toISOString(),
    });

    setUsuario({ ...usuario, wallet });
    setMensaje(`✅ Recarga exitosa de $${monto}.`);
    setMonto(0);
  };

  const wallet = usuario.wallet;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Wallet de {usuario.alias}
        </h1>

        <div className="space-y-3 text-gray-700 mb-6">
          <p>
            <strong>Saldo actual:</strong>{" "}
            <span className="text-green-600 font-semibold">
              ${wallet.saldo.toLocaleString()}
            </span>
          </p>
          <p>
            <strong>Categoría:</strong> {wallet.categoria}
          </p>
          <p>
            <strong>Límite diario:</strong> ${wallet.limiteDiario.toLocaleString()}
          </p>
          <p>
            <strong>Consumo hoy:</strong> ${wallet.consumoHoy.toLocaleString()}
          </p>
        </div>

        {/* Recarga */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Nueva recarga</h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <input
              type="number"
              className="border border-gray-300 rounded-md px-3 py-2 w-32 text-center"
              placeholder="Monto"
              min={1}
              value={monto || ""}
              onChange={(e) => setMonto(Number(e.target.value))}
            />
            <button
              onClick={handleRecarga}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all"
            >
              Recargar
            </button>
          </div>
          {mensaje && (
            <p
              className={`text-center font-medium ${
                mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensaje}
            </p>
          )}
        </div>

        {/* Historial */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Historial de recargas
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-right">Monto (USD)</th>
              </tr>
              </thead>
              <tbody>
              {wallet.historialRecargas.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(r.fecha).toLocaleString("es-CR")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ${r.monto.toLocaleString()}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

