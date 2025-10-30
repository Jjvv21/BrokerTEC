import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function EmpresaReportes() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [historial, setHistorial] = useState([]);

  // 🔹 Obtener token desde localStorage
  const token = localStorage.getItem("authtoken");

  // 🔹 Cargar empresas al iniciar
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/empresas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      })
      .then((res) => setEmpresas(res.data))
      .catch((err) => console.error("Error cargando empresas:", err));
  }, [token]);

  // 🔹 Al seleccionar una empresa, cargar su historial de precios
  const handleSeleccion = async (id) => {
    setEmpresaId(id);
    try {
      const res = await axios.get(
        `http://localhost:3001/api/empresas/${id}/precios`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setHistorial(res.data);
    } catch (err) {
      console.error("Error cargando precios:", err);
      setHistorial([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Reporte de Precios por Empresa
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Selecciona una empresa para visualizar su historial de precios.
        </p>

        {/* 🔹 Selector de empresa */}
        <div className="flex justify-center mb-8">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 w-72"
            onChange={(e) => handleSeleccion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una empresa
            </option>
            {empresas.map((e) => (
              <option key={e.id_empresa} value={e.id_empresa}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Gráfico */}
        {empresaId && historial.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historial}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  formatter={(v) => `$${v.toFixed(2)}`}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="precio"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Precio (USD)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            {empresaId
              ? "No hay datos disponibles para esta empresa."
              : "Selecciona una empresa para ver su gráfico."}
          </p>
        )}
      </div>
    </div>
  );
}
