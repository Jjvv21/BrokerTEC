import { useEffect, useState } from "react";
import type { Empresa } from "../../models/types";
import { getTopEmpresasPorCapitalizacion } from "../../services/mock";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TraderHome() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setEmpresas(getTopEmpresasPorCapitalizacion());
  }, []);

  // Convertir datos para el gráfico
  const dataGrafico = empresas.map((e) => ({
    nombre: e.nombre,
    capitalizacion: e.precioActual * e.cantidadTotal,
  }));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white shadow-md rounded-xl p-8">
        {/* ===== Encabezado ===== */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Bienvenido al Panel de Trader
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Aquí puedes ver las empresas con mayor capitalización de mercado.
        </p>

        {/* ===== Botones ===== */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => navigate("/trader/wallet")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Wallet
          </button>

          <button
            onClick={() => navigate("/trader/portafolio")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Portafolio
          </button>
        </div>

        {/* ===== Gráfico ===== */}
        {dataGrafico.length > 0 && (
          <div className="h-64 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataGrafico}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <YAxis type="category" dataKey="nombre" width={100} />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString()}`}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Bar dataKey="capitalizacion" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ===== Tabla ===== */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-left">Mercado</th>
              <th className="px-4 py-2 text-right">Precio Actual</th>
              <th className="px-4 py-2 text-right">Capitalización</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {empresas.map((e, i) => (
              <tr key={e.id} className="border-b hover:bg-gray-50 transition-all">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-blue-700">{e.nombre}</td>
                <td className="px-4 py-2">{e.mercadoId}</td>
                <td className="px-4 py-2 text-right">${e.precioActual}</td>
                <td className="px-4 py-2 text-right">
                  ${(e.precioActual * e.cantidadTotal).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => navigate(`/trader/empresa/${e.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md transition-all"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
