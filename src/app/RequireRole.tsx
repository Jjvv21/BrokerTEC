import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface RequireRoleProps {
  rol: string; // el rol esperado
  children: ReactNode;
}

export default function RequireRole({ rol, children }: RequireRoleProps) {
  const storedUser = localStorage.getItem("usuario");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 🔹 Si no hay usuario logueado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Si el usuario no tiene el rol requerido
  if (user.rol?.toLowerCase() !== rol.toLowerCase()) {
    // Redirige al home de su propio rol (no se bloquea el acceso total)
    return <Navigate to={`/${user.rol.toLowerCase()}`} replace />;
  }

  // 🔹 Si pasa las validaciones, renderiza el contenido
  return <>{children}</>;
}
