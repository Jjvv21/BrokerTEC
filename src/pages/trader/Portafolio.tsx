import { useEffect, useState } from "react";
import { getPortfolio } from "../../services/api";

interface PortfolioItem {
  id_empresa: number;
  empresa_nombre: string;
  mercado_nombre: string;
  cantidad: number;
  costo_promedio: number;
  precio_actual: number;
  valor_actual: number;
  costo_total: number;
}

export default function Portafolio() {
  const [portafolio, setPortafolio] = useState<PortfolioItem[]>([]);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [walletSaldo, setWalletSaldo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Cargar datos REALES del backend
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        console.log('🔄 Cargando portfolio real...');
        const data = await getPortfolio();
        console.log('✅ Portfolio real recibido:', data);
        
        setPortafolio(data.positions || []);
        setValorTotal(data.totalPortfolio || 0);
        setWalletSaldo(data.wallet || 0);
      } catch (err) {
        console.error('❌ Error cargando portfolio:', err);
        setError("Error al cargar el portfolio");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando portfolio...</div>;
  if (error) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{error}</div>;

  const totalGeneral = valorTotal + walletSaldo;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-5xl w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Mi Portfolio
        </h1>
        
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Valor del Portfolio</h3>
            <p className="text-2xl font-bold">${valorTotal.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Saldo en Wallet</h3>
            <p className="text-2xl font-bold">${walletSaldo.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Valor Total</h3>
            <p className="text-2xl font-bold">${totalGeneral.toLocaleString()}</p>
          </div>
        </div>

        {portafolio.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">
            No tienes posiciones activas.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm md:text-base border-collapse">
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
                    const diferencia = p.valor_actual - p.costo_total;
                    const positivo = diferencia >= 0;

                    return (
                      <tr key={p.id_empresa} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-blue-700">
                          {p.empresa_nombre}
                        </td>
                        <td className="px-4 py-2">{p.mercado_nombre}</td>
                        <td className="px-4 py-2 text-right">
                          {p.cantidad.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${p.costo_promedio.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${p.precio_actual.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${p.valor_actual.toLocaleString()}
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
          </>
        )}
      </div>
    </div>
  );
}