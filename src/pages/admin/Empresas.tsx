import { useEffect, useState } from "react";
import axios from "axios";

export default function Empresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3001/api/admin/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresas(res.data);
    } catch (err) {
      console.error("Error cargando empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  const delistarEmpresa = async (id: number) => {
    const justificacion = prompt("Ingrese la justificación del delistado:");
    if (!justificacion) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `http://localhost:3001/api/admin/companies/${id}/delist`,
        { justificacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchEmpresas(); // refresca tabla
    } catch (err: any) {
      console.error("Error al delistar empresa:", err);
      alert(err.response?.data?.message || "Error al delistar la empresa.");
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando empresas...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Gestión de Empresas
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Mercado</th>
              <th className="px-4 py-2 text-left">Precio Actual</th>
              <th className="px-4 py-2 text-left">Inventario</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {empresas.map((e) => (
              <tr key={e.id_empresa} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-blue-600">{e.nombre}</td>
                <td className="px-4 py-2">{e.mercado}</td>
                <td className="px-4 py-2">${e.precio_actual}</td>
                <td className="px-4 py-2">{e.inventario.toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => delistarEmpresa(e.id_empresa)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition-all"
                  >
                    Deslistar
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
