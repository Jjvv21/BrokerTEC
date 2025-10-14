import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Empresa, PrecioHistorico } from "../../models/types";
import { empresasMock, getPrecioSeries } from "../../services/mock";

export default function EmpresaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [precios, setPrecios] = useState<PrecioHistorico[]>([]);

  useEffect(() => {
    if (id) {
      const encontrada = empresasMock.find((e) => e.id === id);
      if (!encontrada) return navigate("/trader"); // si no existe, vuelve al home
      setEmpresa(encontrada);
      setPrecios(getPrecioSeries(id));
    }
  }, [id, navigate]);

  if (!empresa) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {empresa.nombre}
        </h1>
        <p className="text-gray-600 mb-6">
          Mercado: <span className="font-semibold">{empresa.mercadoId}</span>
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Precio actual</p>
            <p className="text-2xl font-semibold text-green-600">
              ${empresa.precioActual}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Acciones disponibles (Tesorería)</p>
            <p className="text-2xl font-semibold text-blue-600">
              {empresa.inventarioTesoreria.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabla simple de precios anteriores */}
        <h2 className="text-xl font-semibold mb-3 text-gray-700">
          Historial de precios
        </h2>
        <table className="w-full text-sm border-collapse">
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

        {/* Botón para operar */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/trader/operar/${empresa.id}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Operar con {empresa.nombre}
          </button>
        </div>
      </div>
    </div>
  );
}
