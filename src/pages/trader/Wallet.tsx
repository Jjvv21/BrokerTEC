import { useEffect, useState } from "react";
import { getWalletInfo, rechargeWallet } from "../../services/api";

interface WalletData {
  saldo: number;
  nombre_categoria: string;
  limite_diario: number;
  consumo_hoy: number;
}

export default function Wallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [monto, setMonto] = useState<number>(0);
  const [mensaje, setMensaje] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [recargando, setRecargando] = useState(false);

  // ✅ Cargar datos REALES del backend
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        console.log('🔄 Cargando datos del wallet...');
        const data = await getWalletInfo();
        console.log('✅ Datos del wallet recibidos:', data);
        setWalletData(data);
      } catch (err) {
        console.error('❌ Error cargando wallet:', err);
        setMensaje("Error al cargar los datos del wallet");
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  // ✅ Recarga REAL con el backend
  const handleRecarga = async () => {
    if (monto <= 0) {
      setMensaje("⚠️ Ingrese un monto válido.");
      return;
    }

    if (!walletData) return;

    // Validar límite diario
    const nuevoConsumo = walletData.consumo_hoy + monto;
    if (nuevoConsumo > walletData.limite_diario) {
      const restante = walletData.limite_diario - walletData.consumo_hoy;
      setMensaje(`❌ Límite diario alcanzado. Solo puede recargar $${restante}.`);
      return;
    }

    setRecargando(true);
    try {
      console.log('🔄 Enviando recarga al backend...');
      const resultado = await rechargeWallet(monto);
      console.log('✅ Recarga exitosa:', resultado);
      
      // Recargar los datos actualizados
      const nuevoWallet = await getWalletInfo();
      setWalletData(nuevoWallet);
      
      setMensaje(`✅ Recarga exitosa de $${monto}.`);
      setMonto(0);
    } catch (error: any) {
      console.error('❌ Error en recarga:', error);
      setMensaje(error.response?.data?.error || "Error al procesar la recarga");
    } finally {
      setRecargando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando wallet...</div>;
  if (!walletData) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">No se pudieron cargar los datos del wallet</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Mi Wallet
        </h1>

        {/* Resumen del Wallet */}
        <div className="space-y-3 text-gray-700 mb-6">
          <p>
            <strong>Saldo actual:</strong>{" "}
            <span className="text-green-600 font-semibold">
              ${walletData.saldo.toLocaleString()}
            </span>
          </p>
          <p>
            <strong>Categoría:</strong> {walletData.nombre_categoria}
          </p>
          <p>
            <strong>Límite diario:</strong> ${walletData.limite_diario.toLocaleString()}
          </p>
          <p>
            <strong>Consumo hoy:</strong> ${walletData.consumo_hoy.toLocaleString()}
          </p>
        </div>

        {/* Sección de Recarga */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Nueva recarga</h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <input
              type="number"
              className="border border-gray-300 rounded-md px-3 py-2 w-32 text-center"
              placeholder="Monto"
              min={1}
              value={monto || ""}
              onChange={(e) => setMonto(Number(e.target.value))}
              disabled={recargando}
            />
            <button
              onClick={handleRecarga}
              disabled={recargando || monto <= 0}
              className={`${
                recargando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded-md transition-all disabled:opacity-50`}
            >
              {recargando ? 'Procesando...' : 'Recargar'}
            </button>
          </div>
          
          {mensaje && (
            <p
              className={`text-center font-medium ${
                mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}