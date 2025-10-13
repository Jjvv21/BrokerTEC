// src/features/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function Login() {
  const [alias, setAlias] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(alias);
    if (ok) {
      const user = JSON.parse(localStorage.getItem("usuario")!);
      navigate(`/${user.rol.toLowerCase()}`); // ej: /trader, /admin, /analista
    } else {
      alert("Alias no encontrado");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">BrokerTEC - Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Alias"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
