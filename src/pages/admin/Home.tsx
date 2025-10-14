import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Bienvenido al área administrativa. Desde aquí puedes gestionar usuarios, empresas y precios del sistema.
        </p>

        <div className="flex justify-center flex-wrap gap-6">
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Gestión de Usuarios
          </button>

          <button
            onClick={() => navigate("/admin/empresas")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Empresas
          </button>

          <button
            onClick={() => navigate("/admin/precios")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Actualización de Precios
          </button>
        </div>
      </div>
    </div>
  );
}
