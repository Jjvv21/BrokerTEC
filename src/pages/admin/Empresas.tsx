import { useState } from "react";
import { empresasMock } from "../../services/mock";

export default function Empresas() {
  const [empresas] = useState(empresasMock);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Gestión de Empresas
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:tect-base border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Mercado</th>
              <th className="px-4 py-2 text-right">Precio Actual</th>
              <th className="px-4 py-2 text-right">Inventario</th>
            </tr>
            </thead>
            <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-blue-700">{e.nombre}</td>
                <td className="px-4 py-2">{e.mercadoId}</td>
                <td className="px-4 py-2 text-right">${e.precioActual}</td>
                <td className="px-4 py-2 text-right">{e.inventarioTesoreria.toLocaleString()}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
