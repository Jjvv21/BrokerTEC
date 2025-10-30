import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getWalletInfo } from "../../services/api";

interface UserProfile {
  id_usuario: number;
  alias: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  pais_de_origen: string;
  id_rol: number;
  estado: boolean;
  nombre_categoria?: string;
  nombre_rol?: string;
}

interface WalletInfo {
  saldo: number;
  nombre_categoria: string;
  limite_diario: number;
  consumo_hoy: number;
}

export default function Profile() {
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Función de diagnóstico mejorada
  const diagnosticTest = async () => {
    try {
      console.group('🔍 DIAGNÓSTICO DETALLADO PERFIL');
      
      const token = localStorage.getItem('authToken');
      console.log('1. Token:', token ? `✅ Presente (${token.length} chars)` : '❌ Ausente');
      
      if (!token) {
        navigate('/login');
        return null;
      }
      
      const response = await fetch('http://localhost:3001/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   - Status:', response.status);
      
      const responseText = await response.text();
      console.log('   - Response body:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      console.log('   - ✅ Datos parseados:', data);
      
      console.groupEnd();
      return data;
      
    } catch (error) {
      console.groupEnd();
      console.error('❌ Error en diagnóstico:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Iniciando carga de perfil...');
        
        try {
          console.log('🔄 Intentando carga normal con getUserProfile()...');
          const [profileData, walletData] = await Promise.all([
            getUserProfile(),
            getWalletInfo().catch(err => {
              console.log('⚠️ Error en wallet, continuando sin wallet:', err);
              return null;
            })
          ]);
          
          console.log('✅ Perfil recibido:', profileData);
          console.log('✅ Wallet recibido:', walletData);
          
          setUsuario(profileData);
          setWallet(walletData);
          
        } catch (normalError) {
          console.log('⚠️ Error en carga normal, intentando diagnóstico...', normalError);
          const diagnosticData = await diagnosticTest();
          
          if (diagnosticData) {
            setUsuario(diagnosticData);
            
            if (diagnosticData.id_rol === 2) {
              try {
                console.log('💰 Cargando información de wallet...');
                const walletData = await getWalletInfo();
                console.log('✅ Wallet cargado:', walletData);
                setWallet(walletData);
              } catch (walletError) {
                console.log('⚠️ Error cargando wallet, continuando sin wallet:', walletError);
              }
            }
          }
        }
        
      } catch (err: any) {
        console.error('❌ Error final en carga de perfil:', err);
        const errorMessage = err.message || 'Error desconocido';
        setError(errorMessage);
        
        if (err.message.includes('401') || err.message.includes('403')) {
          console.log('🔐 Error de autenticación, redirigiendo a login');
          localStorage.removeItem('authToken');
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [navigate]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error al cargar el perfil</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            >
              Reintentar
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex-1"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Error: No se pudieron cargar los datos del perfil</div>
      </div>
    );
  }

  // Determinar el rol basado en id_rol
  const getRolNombre = (idRol: number) => {
    switch(idRol) {
      case 1: return "Admin";
      case 2: return "Trader"; 
      case 3: return "Analista";
      default: return "Usuario";
    }
  };

  const rolNombre = getRolNombre(usuario.id_rol);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header del Perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
            <p className="text-blue-100 mt-2">Gestiona tu información personal</p>
          </div>

          {/* Información del Usuario */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Información Personal
                </h2>
                
                <div className="space-y-3">
                  <InfoItem label="Alias" value={usuario.alias} />
                  <InfoItem label="Nombre" value={usuario.nombre} />
                  <InfoItem label="Correo" value={usuario.correo} />
                  <InfoItem label="Teléfono" value={usuario.telefono || "No especificado"} />
                  <InfoItem label="Dirección" value={usuario.direccion || "No especificada"} />
                  <InfoItem label="País de origen" value={usuario.pais_de_origen || "No especificado"} />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Información de Cuenta
                </h2>
                
                <div className="space-y-3">
                  <InfoItem label="Rol" value={rolNombre} />
                  <InfoItem 
                    label="Estado" 
                    value={
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.estado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </span>
                    } 
                  />
                  {usuario.nombre_categoria && (
                    <InfoItem label="Categoría" value={usuario.nombre_categoria} />
                  )}
                </div>
              </div>
            </div>

            {/* Información de Wallet (solo para Traders) */}
            {wallet && rolNombre === "Trader" && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Información de Wallet
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <WalletItem 
                    label="Saldo" 
                    value={`$${wallet.saldo.toLocaleString()}`} 
                    className="text-green-600 font-bold" 
                  />
                  <WalletItem label="Categoría" value={wallet.nombre_categoria} />
                  <WalletItem label="Límite diario" value={`$${wallet.limite_diario.toLocaleString()}`} />
                  <WalletItem label="Consumo hoy" value={`$${wallet.consumo_hoy.toLocaleString()}`} />
                </div>
              </div>
            )}

            {/* Botones de Acción - CORREGIDOS */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('🎯 Navegando a /edit-profile');
                  navigate("/edit-profile");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2"
              >
                <span>✏️</span> Editar Perfil
              </button>

              <button
                onClick={() => {
                  console.log('🎯 Navegando a /change-password');
                  navigate("/change-password");
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2"
              >
                <span>🔒</span> Cambiar Contraseña
              </button>

              {rolNombre === "Trader" && (
                <button
                  onClick={() => navigate("/trader/seguridad")}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2"
                >
                  <span>🛡️</span> Seguridad
                </button>
              )}
            </div>

            {/* Mensaje de error si existe */}
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Nota:</strong> {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para items de información
function InfoItem({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

// Componente auxiliar para items del wallet
function WalletItem({ 
  label, 
  value, 
  className = "" 
}: { 
  label: string; 
  value: string; 
  className?: string; 
}) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <span className="text-sm text-gray-500 font-medium block">{label}</span>
      <span className={`text-gray-900 ${className}`}>{value}</span>
    </div>
  );
}