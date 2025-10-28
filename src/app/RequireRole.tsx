import { Navigate } from "react-router-dom";
import type { ReactNode } from "react"; // ← Agregar 'type'

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

  // ✅ CONVERTIR rolId A STRING
  const userRole = user.rolId === 1 ? 'admin' : 
                   user.rolId === 2 ? 'trader' : 'analyst';

  // 🔹 Si el usuario no tiene el rol requerido
  if (userRole !== rol.toLowerCase()) {
    // Redirige al home de su propio rol
    return <Navigate to={`/${userRole}`} replace />;
  }

  // 🔹 Si pasa las validaciones, renderiza el contenido
  return <>{children}</>;
}