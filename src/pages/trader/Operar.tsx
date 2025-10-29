import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompanyDetail, buyStock, sellStock, getWalletInfo } from "../../services/api";

interface EmpresaReal {
  id_empresa: number;
  nombre: string;
  simbolo: string;
  precio_actual: number;
  cantidad_acciones: number;
  capitalizacion: number;
  acciones_disponibles: number;
  mercado_nombre: string;
}

export default function Operar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<EmpresaReal | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [mensaje, setMensaje] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [operando, setOperando] = useState(false);
  const [maxComprable, setMaxComprable] = useState<number>(0);

  // ✅ Cargar datos REALES de la empresa
  useEffect(() => {
    const loadEmpresa = async () => {
      if (!id) {
        setMensaje("ID de empresa no válido");
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Cargando datos reales de empresa...');
        const data = await getCompanyDetail(id);
        console.log('✅ Empresa real recibida:', data);
        setEmpresa(data);
        
        // Calcular máximo comprable aproximado
        const walletData = await getWalletInfo();
        const maxAprox = Math.floor(walletData.saldo / data.precio_actual);
        setMaxComprable(Math.min(maxAprox, data.acciones_disponibles || 0));
        
      } catch (err) {
        console.error('❌ Error cargando empresa:', err);
        setMensaje("Error al cargar los datos de la empresa");
      } finally {
        setLoading(false);
      }
    };

    loadEmpresa();
  }, [id]);

  // ✅ Compra REAL con el backend
  const handleCompra = async () => {
    if (!empresa || cantidad <= 0) {
      setMensaje("⚠️ Ingrese una cantidad válida");
      return;
    }

    if (cantidad > maxComprable) {
      setMensaje(`❌ No puede comprar más de ${maxComprable} acciones`);
      return;
    }

    setOperando(true);
    setMensaje("🔄 Procesando compra...");
    
    try {
      console.log('🔄 Enviando orden de compra...');
      const resultado = await buyStock(empresa.id_empresa.toString(), cantidad);
      console.log('✅ Compra exitosa:', resultado);
      
      setMensaje(`✅ ${resultado.message} - Costo: $${resultado.totalCost}`);
      setCantidad(0);
      
      // Recargar datos actualizados
      setTimeout(() => {
        window.location.reload(); // Simple refresh para ver cambios
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error en compra:', error);
      setMensaje(`❌ ${error.response?.data?.error || error.message}`);
    } finally {
      setOperando(false);
    }
  };

  // ✅ Venta REAL con el backend
  const handleVenta = async () => {
    if (!empresa || cantidad <= 0) {
      setMensaje("⚠️ Ingrese una cantidad válida");
      return;
    }

    setOperando(true);
    setMensaje("🔄 Procesando venta...");
    
    try {
      console.log('🔄 Enviando orden de venta...');
      const resultado = await sellStock(empresa.id_empresa.toString(), cantidad);
      console.log('✅ Venta exitosa:', resultado);
      
      setMensaje(`✅ ${resultado.message} - Ganancia: $${resultado.totalEarned}`);
      setCantidad(0);
      
      // Recargar datos actualizados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error en venta:', error);
      setMensaje(`❌ ${error.response?.data?.error || error.message}`);
    } finally {
      setOperando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando datos de la empresa...</div>;
  if (!empresa) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Empresa no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Operar</h1>
        <h2 className="text-xl text-blue-600 mb-6">{empresa.nombre} ({empresa.simbolo})</h2>

        {/* Información de la empresa */}
        <div className="space-y-2 mb-6 text-gray-700">
          <p><strong>Mercado:</strong> {empresa.mercado_nombre}</p>
          <p><strong>Precio actual:</strong> ${empresa.precio_actual?.toFixed(2)}</p>
          <p><strong>Acciones disponibles:</strong> {(empresa.acciones_disponibles || 0).toLocaleString()}</p>
          <p><strong>Capitalización:</strong> ${empresa.capitalizacion?.toLocaleString()}</p>
          <p><strong>Máximo comprable:</strong> {maxComprable.toLocaleString()} acciones</p>
        </div>

        {/* Operación */}
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a operar
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max={maxComprable}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              disabled={operando}
              placeholder={`Máx: ${maxComprable}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo comprable: {maxComprable} acciones
            </p>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleCompra}
              disabled={operando || cantidad <= 0 || cantidad > maxComprable}
              className={`flex-1 ${
                operando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } text-white py-2 px-4 rounded-md transition-all disabled:opacity-50`}
            >
              {operando ? 'Procesando...' : 'Comprar'}
            </button>
            
            <button
              onClick={handleVenta}
              disabled={operando || cantidad <= 0}
              className={`flex-1 ${
                operando ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              } text-white py-2 px-4 rounded-md transition-all disabled:opacity-50`}
            >
              {operando ? 'Procesando...' : 'Vender'}
            </button>
          </div>

          {mensaje && (
            <p className={`text-center font-medium ${
              mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}>
              {mensaje}
            </p>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}