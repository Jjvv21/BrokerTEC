import { useEffect, useState } from "react";
import axios from "axios";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`http://localhost:3001/api/admin/users/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsuarios(); // refresca la lista
    } catch (err) {
      console.error("Error cambiando estado:", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando usuarios...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Gestión de Usuarios
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{u.nombre}</td>
                <td className="px-4 py-2">{u.rol}</td>
                <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        u.estado === "activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.estado}
                    </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => toggleEstado(u.id)}
                    className={`${
                      u.estado === "activo"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white px-4 py-1 rounded-md text-sm transition-all`}
                  >
                    {u.estado === "activo" ? "Deshabilitar" : "Activar"}
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
