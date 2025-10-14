import { useEffect, useState } from "react";
import { usuariosMock } from "../../services/mock";
import type { Usuario } from "../../models/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TopTraders() {
  const [data, setData] = useState<
    { alias: string; wallet: number; acciones: number }[]
  >([]);

  useEffect(() => {
    // Filtrar solo usuarios tipo Trader
    const traders = usuariosMock.filter((u) => u.rol === "Trader");

    // Calcular saldo y valor total en portafolio
    const procesados = traders.map((t) => {
      const valorAcciones =
        t.portafolio?.reduce(
          (sum, p) => sum + p.precioActual * p.cantidad,
          0
        ) || 0;
      return {
        alias: t.alias,
        wallet: t.wallet?.saldo || 0,
        acciones: valorAcciones,
      };
    });

    // Ordenar por mayor total (wallet + acciones)
    procesados.sort(
      (a, b) => b.wallet + b.acciones - (a.wallet + a.acciones)
    );

    setData(procesados.slice(0, 5)); // Solo los top 5
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Top Traders por Capital
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Comparativo entre el saldo disponible en Wallet y el valor total de
          acciones en portafolio.
        </p>

        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
                />
                <YAxis type="category" dataKey="alias" width={100} />
                <Tooltip
                  formatter={(v: number) => `$${v.toLocaleString()}`}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
                <Bar dataKey="wallet" fill="#16a34a" name="Saldo Wallet" />
                <Bar dataKey="acciones" fill="#2563eb" name="Valor en Acciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No hay traders disponibles.</p>
        )}
      </div>
    </div>
  );
}
