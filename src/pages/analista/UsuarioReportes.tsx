import { useState, useEffect } from "react";
import axios from "axios";

export default function UsuarioReportes() {
  const [usuarios, setUsuarios] = useState([]);
  const [aliasSeleccionado, setAliasSeleccionado] = useState("");
  const [transacciones, setTransacciones] = useState([]);

  // 🔹 Al cargar, obtener lista de usuarios (solo traders)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get("http://localhost:3001/api/usuarios/traders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, []);

  // 🔹 Al seleccionar un usuario, obtener sus transacciones
  const handleSeleccion = async (alias) => {
    setAliasSeleccionado(alias);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `http://localhost:3001/api/analyst/user-report/${alias}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      setTransacciones(res.data);
    } catch (err) {
      console.error("Error cargando transacciones:", err);
      setTransacciones([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Reportes por Usuario
        </h1>

        <div className="flex justify-center mb-8">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 w-72"
            onChange={(e) => handleSeleccion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona un usuario
            </option>
            {usuarios.map((u) => (
              <option key={u.id_usuario} value={u.alias}>
                {u.alias} ({u.nombre})
              </option>
            ))}
          </select>
        </div>

        {aliasSeleccionado && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Transacciones de {aliasSeleccionado}
            </h2>
            <table className="min-w-full text-sm border-collapse">
              <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio</th>
                <th className="px-4 py-2 text-right">Fecha</th>
              </tr>
              </thead>
              <tbody>
              {transacciones.length > 0 ? (
                transacciones.map((t) => (
                  <tr key={t.id_transaccion} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{t.empresa_nombre}</td>
                    <td
                      className={`px-4 py-2 ${
                        t.tipo === "compra" ? "text-green-600" : "text-red-600"
                      } font-medium`}
                    >
                      {t.tipo.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {t.cantidad.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">${t.precio}</td>
                    <td className="px-4 py-2 text-right">
                      {new Date(t.fecha).toLocaleDateString("es-CR")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No hay transacciones registradas para este usuario.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
