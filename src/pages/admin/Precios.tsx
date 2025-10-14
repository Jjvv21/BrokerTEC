import { useState } from "react";
import { empresasMock } from "../../services/mock";

export default function Precios() {
  const [empresas, setEmpresas] = useState(empresasMock);
  const [mensaje, setMensaje] = useState<string>("");

  const handleActualizar = (id: string, nuevoPrecio: number) => {
    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, precioActual: nuevoPrecio } : e
      )
    );
    setMensaje(`✅ Precio actualizado para la empresa ${id}.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Actualización de Precios
        </h1>

        {mensaje && (
          <p className="text-green-600 font-medium text-center mb-4">
            {mensaje}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:tect-base border-collapse">
            <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-right">Precio Actual</th>
              <th className="px-4 py-2 text-center">Nuevo Precio</th>
            </tr>
            </thead>
            <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-blue-700">{e.nombre}</td>
                <td className="px-4 py-2 text-right">${e.precioActual}</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-md px-2 py-1 w-24 text-right"
                    onChange={(ev) =>
                      handleActualizar(e.id, Number(ev.target.value))
                    }
                  />
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
