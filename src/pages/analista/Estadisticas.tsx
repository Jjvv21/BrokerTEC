import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Estadisticas() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("http://localhost:3001/api/analyst/global-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando estadísticas...</p>;
  }

  if (!stats) {
    return <p className="text-center mt-10 text-red-500">No se pudieron cargar las estadísticas.</p>;
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b"];
  const dataRoles = stats.usuariosPorRol.map((r: any) => ({
    name: r.rol,
    value: r.cantidad,
  }));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Estadísticas Globales del Sistema
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
          {/* ===== Gráfico ===== */}
          <div className="w-full md:w-1/2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataRoles}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {dataRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} usuarios`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ===== Tabla ===== */}
          <div className="w-full md:w-1/2">
            <table className="min-w-full border-collapse text-gray-700">
              <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2 text-right">Porcentaje</th>
              </tr>
              </thead>
              <tbody>
              {dataRoles.map((r: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2 text-right">{r.value}</td>
                  <td className="px-4 py-2 text-right">
                    {((r.value / stats.totalUsuarios) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-2">Total de usuarios</td>
                <td className="px-4 py-2 text-right">{stats.totalUsuarios}</td>
                <td className="px-4 py-2 text-right">100%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-gray-700">
                  Empresas registradas
                </td>
                <td className="px-4 py-2 text-right" colSpan={2}>
                  {stats.totalEmpresas}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Datos obtenidos directamente desde la base de datos.
        </p>
      </div>
    </div>
  );
}
