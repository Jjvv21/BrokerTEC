import { useState } from "react";
import { usuariosMock, transaccionesMock } from "../../services/mock";
import type { Transaccion } from "../../models/types";

export default function UsuarioReportes() {
  const [aliasSeleccionado, setAliasSeleccionado] = useState<string>("");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  const handleSeleccion = (alias: string) => {
    setAliasSeleccionado(alias);
    const tx = transaccionesMock.filter((t) => t.usuarioAlias === alias);
    setTransacciones(tx);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Reportes por Usuario
        </h1>

        <div className="flex justify-center mb-6">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 w-72"
            onChange={(e) => handleSeleccion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona un usuario
            </option>
            {usuariosMock
              .filter((u) => u.rol === "Trader")
              .map((u) => (
                <option key={u.id} value={u.alias}>
                  {u.alias} ({u.nombre})
                </option>
              ))}
          </select>
        </div>

        {aliasSeleccionado && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Transacciones de {aliasSeleccionado}
            </h2>
            <table className="min-w-full border-collapse">
              <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio</th>
                <th className="px-4 py-2 text-right">Fecha</th>
              </tr>
              </thead>
              <tbody>
              {transacciones.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{t.empresaNombre}</td>
                  <td
                    className={`px-4 py-2 ${
                      t.tipo === "compra" ? "text-green-600" : "text-red-600"
                    } font-medium`}
                  >
                    {t.tipo.toUpperCase()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {t.cantidad.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">${t.precio}</td>
                  <td className="px-4 py-2 text-right">
                    {new Date(t.timestamp).toLocaleDateString("es-CR")}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
