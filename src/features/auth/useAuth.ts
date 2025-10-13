// src/features/auth/useAuth.ts
import { useState } from "react";
import type { Usuario } from "../../models/types";
import { mockUsuarios } from "../../services/mock";

export function useAuth() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  function login(alias: string) {
    const user = mockUsuarios.find((u) => u.alias === alias);
    if (user) {
      setUsuarioActual(user);
      localStorage.setItem("usuario", JSON.stringify(user));
      return true;
    }
    return false;
  }

  function logout() {
    setUsuarioActual(null);
    localStorage.removeItem("usuario");
  }

  return { usuarioActual, login, logout };
}
