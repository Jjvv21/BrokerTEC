import { usuariosMock, empresasMock } from "../../services/mock";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Estadisticas() {
  const totalUsuarios = usuariosMock.length;
  const traders = usuariosMock.filter((u) => u.rol === "Trader").length;
  const analistas = usuariosMock.filter((u) => u.rol === "Analista").length;
  const admins = usuariosMock.filter((u) => u.rol === "Admin").length;
  const totalEmpresas = empresasMock.length;

  const dataRoles = [
    { name: "Traders", value: traders },
    { name: "Analistas", value: analistas },
    { name: "Administradores", value: admins },
  ];

  const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Estadísticas Globales del Sistema
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Distribución de usuarios por rol y resumen general del ecosistema BrokerTEC.
        </p>

        {/* ====== Sección de gráfico ====== */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
          <div className="w-full md:w-1/2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataRoles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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
                <Tooltip
                  formatter={(v: number) => `${v} usuarios`}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ====== Tabla de resumen ====== */}
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
              {dataRoles.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2 text-right">{r.value}</td>
                  <td className="px-4 py-2 text-right">
                    {((r.value / totalUsuarios) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-2">Total de usuarios</td>
                <td className="px-4 py-2 text-right">{totalUsuarios}</td>
                <td className="px-4 py-2 text-right">100%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-gray-700">
                  Empresas registradas
                </td>
                <td className="px-4 py-2 text-right" colSpan={2}>
                  {totalEmpresas}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Datos generados a partir del entorno de pruebas (mock local).
        </p>
      </div>
    </div>
  );
}
