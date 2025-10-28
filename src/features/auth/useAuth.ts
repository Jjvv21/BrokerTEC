// src/features/auth/useAuth.ts
import { useState } from "react";
import type { Usuario } from "../../models/types";

export function useAuth() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  // Esta función ya no se usa para login, solo para logout
  function logout() {
    setUsuarioActual(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("authToken"); // ← Agregar
  }

  return { usuarioActual, logout };
}