import { useState } from "react";
import { empresasMock, getPrecioSeries } from "../../services/mock";
import type { Empresa, PrecioHistorico } from "../../models/types";

export default function EmpresaReportes() {
  const [seleccion, setSeleccion] = useState<string>("");
  const [precios, setPrecios] = useState<PrecioHistorico[]>([]);

  const handleSeleccion = (id: string) => {
    setSeleccion(id);
    setPrecios(getPrecioSeries(id));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Reportes por Empresa
        </h1>

        <div className="flex justify-center mb-6">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 w-72"
            onChange={(e) => handleSeleccion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una empresa
            </option>
            {empresasMock.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        {seleccion && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Historial de precios
            </h2>
            <table className="min-w-full border-collapse">
              <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-right">Precio (USD)</th>
              </tr>
              </thead>
              <tbody>
              {precios.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(p.fecha).toLocaleDateString("es-CR")}
                  </td>
                  <td className="px-4 py-2 text-right">${p.precio.toFixed(2)}</td>
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
