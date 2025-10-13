import { useState, useEffect } from "react";
import type { Usuario } from "../../models/types";

export default function Profile() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) setUser(JSON.parse(data));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  }

  function handleSave() {
    if (!user) return;
    localStorage.setItem("usuario", JSON.stringify(user));
    setEditMode(false);
    alert("✅ Cambios guardados (modo local)");
  }

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>

      <div className="space-y-3">
        <label className="block">
          <span className="font-semibold">Alias:</span>
          <input
            name="alias"
            value={user.alias}
            onChange={handleChange}
            disabled={!editMode}
            className="border rounded p-2 w-full"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Correo:</span>
          <input
            name="correo"
            value={user.correo}
            disabled
            className="border rounded p-2 w-full bg-gray-100"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Teléfono:</span>
          <input
            name="telefono"
            value={user.telefono}
            onChange={handleChange}
            disabled={!editMode}
            className="border rounded p-2 w-full"
          />
        </label>

        <label className="block">
          <span className="font-semibold">País:</span>
          <input
            name="pais"
            value={user.pais}
            onChange={handleChange}
            disabled={!editMode}
            className="border rounded p-2 w-full"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Rol:</span>
          <input
            name="rol"
            value={user.rol}
            disabled
            className="border rounded p-2 w-full bg-gray-100"
          />
        </label>

        <div className="flex justify-end gap-3 mt-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
