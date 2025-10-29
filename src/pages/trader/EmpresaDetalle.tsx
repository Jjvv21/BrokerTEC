import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyDetail, getPriceHistory } from "../../services/api";

interface CompanyDetail {
  id_empresa: number;
  nombre: string;
  simbolo: string;
  mercado_nombre: string;
  precio_actual: number;
  cantidad_acciones: number;
  capitalizacion: number;
  acciones_disponibles: number;
  mayor_tenedor: string;
}

interface PriceHistory {
  precio: number;
  fecha: string;
}

export default function EmpresaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState<CompanyDetail | null>(null);
  const [precios, setPrecios] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) {
        console.error('❌ No hay ID en la URL');
        setError("ID de empresa no especificado");
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Cargando detalles de empresa ID:', id);
        
        const [companyData, priceData] = await Promise.all([
          getCompanyDetail(id),
          getPriceHistory(id).catch(err => {
            console.log('⚠️ Error cargando histórico, continuando sin él:', err);
            return []; // Continuar sin histórico si falla
          })
        ]);
        
        console.log('✅ Datos de empresa recibidos:', companyData);
        console.log('✅ Historial de precios:', priceData?.length || 0, 'registros');
        
        setEmpresa(companyData);
        setPrecios(priceData || []);
        
      } catch (err: any) {
        console.error('❌ Error cargando datos de empresa:', err);
        setError(err.response?.data?.error || err.message || "Error al cargar los datos de la empresa");
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [id]);

  // Estados de carga mejorados
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la empresa...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            >
              Reintentar
            </button>
            <button 
              onClick={() => navigate("/trader")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex-1"
            >
              Volver al Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Empresa no encontrada</h2>
          <p className="text-gray-700">No se pudo cargar la empresa con ID: {id}</p>
          <button 
            onClick={() => navigate("/trader")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {empresa.nombre} ({empresa.simbolo})
            </h1>
            <p className="text-gray-600">
              Mercado: <span className="font-semibold text-blue-600">{empresa.mercado_nombre}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            ← Volver
          </button>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Precio actual</p>
            <p className="text-2xl font-bold text-green-800">
              ${empresa.precio_actual.toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Acciones disponibles</p>
            <p className="text-2xl font-bold text-blue-800">
              {(empresa.acciones_disponibles || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium">Capitalización</p>
            <p className="text-2xl font-bold text-purple-800">
              ${(empresa.capitalizacion / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium">Mayor tenedor</p>
            <p className="text-lg font-bold text-orange-800">
              {empresa.mayor_tenedor || "administracion"}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Información General</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Total acciones:</span> {empresa.cantidad_acciones.toLocaleString()}</p>
              <p><span className="font-medium">Valor por acción:</span> ${empresa.precio_actual.toFixed(2)}</p>
              <p><span className="font-medium">Disponibles para trading:</span> {(empresa.acciones_disponibles || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Historial de precios */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Últimos precios</h3>
            {precios.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {precios.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{new Date(p.fecha).toLocaleDateString("es-CR")}</span>
                    <span className="font-medium">${p.precio.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay historial de precios disponible</p>
            )}
          </div>
        </div>

        {/* Botón para operar */}
        <div className="text-center border-t pt-6">
          <button
            onClick={() => navigate(`/trader/operar/${empresa.id_empresa}`)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all text-lg font-semibold"
          >
            Operar con {empresa.nombre}
          </button>
          <p className="text-gray-500 text-sm mt-2">
            Compra o vende acciones de esta empresa al precio actual de mercado
          </p>
        </div>
      </div>
    </div>
  );
}