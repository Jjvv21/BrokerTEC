import { useEffect, useState } from "react";
import type { Usuario, PortafolioItem } from "../../models/types";
import { usuariosMock } from "../../services/mock";

export default function Portafolio() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [portafolio, setPortafolio] = useState<PortafolioItem[]>([]);
  const [valorTotal, setValorTotal] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const user = JSON.parse(stored);
      const fullUser = usuariosMock.find((u) => u.usuario === user.usuario);
      if (fullUser) {
        setUsuario(fullUser);
        setPortafolio(fullUser.portafolio || []);
        const total = (fullUser.portafolio || []).reduce(
          (sum, p) => sum + p.valorActual,
          0
        );
        setValorTotal(total);
      }
    }
  }, []);

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Portafolio de {usuario.alias}
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Aquí puedes visualizar tus posiciones actuales y su valor total.
        </p>

        {portafolio.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">
            No tienes posiciones activas.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-2 text-left">Empresa</th>
                  <th className="px-4 py-2 text-left">Mercado</th>
                  <th className="px-4 py-2 text-right">Cantidad</th>
                  <th className="px-4 py-2 text-right">Costo Promedio</th>
                  <th className="px-4 py-2 text-right">Precio Actual</th>
                  <th className="px-4 py-2 text-right">Valor Actual</th>
                  <th className="px-4 py-2 text-right">Ganancia / Pérdida</th>
                </tr>
                </thead>
                <tbody>
                {portafolio.map((p) => {
                  const inversion = p.cantidad * p.costoPromedio;
                  const valor = p.cantidad * p.precioActual;
                  const diferencia = valor - inversion;
                  const positivo = diferencia >= 0;

                  return (
                    <tr key={p.empresaId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-blue-700">
                        {p.empresaNombre}
                      </td>
                      <td className="px-4 py-2">{p.mercadoId}</td>
                      <td className="px-4 py-2 text-right">
                        {p.cantidad.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${p.costoPromedio.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${p.precioActual.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ${p.valorActual.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-semibold ${
                          positivo ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {positivo ? "+" : ""}
                        ${diferencia.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            <div className="text-right text-lg font-semibold text-gray-800">
              Valor total del portafolio:{" "}
              <span className="text-blue-600">${valorTotal.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
