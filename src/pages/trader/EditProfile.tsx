import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/api";

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
}

export default function EditProfile() {
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    pais_de_origen: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserProfile();
        setUsuario(userData);
        setFormData({
          nombre: userData.nombre || "",
          telefono: userData.telefono || "",
          direccion: userData.direccion || "",
          pais_de_origen: userData.pais_de_origen || ""
        });
      } catch (error) {
        console.error('Error cargando perfil:', error);
        setMensaje("Error al cargar los datos del perfil");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensaje("");

    try {
      await updateUserProfile(formData);
      setMensaje("✅ Perfil actualizado correctamente");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error: any) {
      setMensaje(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando...</div>;
  if (!usuario) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Error al cargar el perfil</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País de origen
              </label>
              <input
                type="text"
                name="pais_de_origen"
                value={formData.pais_de_origen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

            {mensaje && (
              <div className={`p-3 rounded-md ${
                mensaje.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}