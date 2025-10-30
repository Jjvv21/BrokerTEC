import { useEffect, useState } from "react";
import axios from "axios";
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
  const [data, setData] = useState<{ alias: string; wallet: number; acciones: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopTraders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3001/api/admin/top-traders?top_n=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(" Datos recibidos del backend:", res.data);

      const traders = res.data;
      const formatted = traders.map((t: any) => ({
        alias: t.alias,
        wallet: t.saldo,
        acciones: 0, // luego puedes cambiar por valor real si lo calculas
      }));

      setData(formatted);
    } catch (err) {
      console.error(" Error al cargar top traders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopTraders();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando Top Traders...</p>;
  }

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
