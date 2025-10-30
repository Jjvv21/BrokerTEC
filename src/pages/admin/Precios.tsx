import { useEffect, useState } from "react";
import axios from "axios";

export default function Precios() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [nuevosPrecios, setNuevosPrecios] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3001/api/admin/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresas(res.data);
    } catch (err) {
      console.error("❌ Error cargando empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPrecio = async (id: number) => {
    const nuevoPrecio = parseFloat(nuevosPrecios[id]);
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
      alert("Ingrese un precio válido.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `http://localhost:3001/api/admin/companies/${id}/price`,
        { nuevo_precio: nuevoPrecio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setNuevosPrecios((prev) => ({ ...prev, [id]: "" }));
      fetchEmpresas(); // refresca los precios actualizados
    } catch (err: any) {
      console.error("Error al actualizar precio:", err);
      alert(err.response?.data?.message || "Error al actualizar precio.");
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
          Actualización de Precios
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-left">Precio Actual</th>
              <th className="px-4 py-2 text-left">Nuevo Precio</th>
              <th className="px-4 py-2 text-center">Acción</th>
            </tr>
            </thead>
            <tbody>
            {empresas.map((e) => (
              <tr key={e.id_empresa} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-blue-600">{e.nombre}</td>
                <td className="px-4 py-2">${e.precio_actual}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded-md px-2 py-1 w-24"
                    value={nuevosPrecios[e.id_empresa] || ""}
                    onChange={(ev) =>
                      setNuevosPrecios({
                        ...nuevosPrecios,
                        [e.id_empresa]: ev.target.value,
                      })
                    }
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => actualizarPrecio(e.id_empresa)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition-all"
                  >
                    Actualizar
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
