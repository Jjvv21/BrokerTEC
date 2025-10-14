import { useNavigate } from "react-router-dom";

export default function AnalistaHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Panel de Analista
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Bienvenido al módulo de análisis. Aquí puedes consultar estadísticas,
          reportes por empresa y actividad de los usuarios.
        </p>

        <div className="flex justify-center flex-wrap gap-6">
          <button
            onClick={() => navigate("/analista/empresa")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Reportes por Empresa
          </button>

          <button
            onClick={() => navigate("/analista/usuario")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Reportes por Usuario
          </button>

          <button
            onClick={() => navigate("/analista/estadisticas")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
          >
            Estadísticas Globales
          </button>
        </div>
      </div>
    </div>
  );
}
