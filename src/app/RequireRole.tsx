import { Navigate } from "react-router-dom";

interface Props {
  allowedRoles: string[];
  children: JSX.Element;
}

export default function RequireRole({ allowedRoles, children }: Props) {
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.rol))
    return <h1 className="text-center text-red-600 mt-10">
      🚫 Acceso denegado
    </h1>;

  return children;
}
