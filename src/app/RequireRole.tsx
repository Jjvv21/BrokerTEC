import { Navigate } from "react-router-dom";

export default function RequireRole({ rol, children }: { rol: string; children: JSX.Element }) {
  const raw = localStorage.getItem("usuario");
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (user.rol !== rol) return <Navigate to="/login" replace />;
  return children;
}
