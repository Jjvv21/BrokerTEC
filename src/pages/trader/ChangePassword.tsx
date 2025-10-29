import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../services/api";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    if (formData.newPassword !== formData.confirmPassword) {
      setMensaje("❌ Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMensaje("❌ La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setMensaje("✅ Contraseña cambiada correctamente");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error: any) {
      setMensaje(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
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