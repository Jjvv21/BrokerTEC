import { usuariosMock, empresasMock } from "../../services/mock";

export default function Estadisticas() {
  const totalUsuarios = usuariosMock.length;
  const traders = usuariosMock.filter((u) => u.rol === "Trader").length;
  const analistas = usuariosMock.filter((u) => u.rol === "Analista").length;
  const admins = usuariosMock.filter((u) => u.rol === "Admin").length;
  const totalEmpresas = empresasMock.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Estadísticas Globales
        </h1>

        <div className="space-y-4 text-gray-700 text-lg">
          <p>
            <strong>Total de usuarios:</strong> {totalUsuarios}
          </p>
          <p>
            <strong>Traders:</strong> {traders}
          </p>
          <p>
            <strong>Analistas:</strong> {analistas}
          </p>
          <p>
            <strong>Administradores:</strong> {admins}
          </p>
          <hr />
          <p>
            <strong>Empresas registradas:</strong> {totalEmpresas}
          </p>
        </div>
      </div>
    </div>
  );
}
