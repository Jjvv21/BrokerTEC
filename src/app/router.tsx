import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import TraderHome from "../pages/trader/Home";
import AdminHome from "../pages/admin/Home";
import AnalistaHome from "../pages/analista/Home";
import Profile from "../features/profile/Profile";
import RequireRole from "./RequireRole";

export const router = createBrowserRouter([
  // Login explícito
  { path: "/login", element: <Login /> },

  // Raíz redirige a /login (opcional pero recomendado)
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/perfil", element: <Profile /> },

  {
    path: "/trader",
    element: (
      <RequireRole rol="Trader">
        <TraderHome />
      </RequireRole>
    ),
  },
  {
    path: "/admin",
    element: (
      <RequireRole rol="Admin">
        <AdminHome />
      </RequireRole>
    ),
  },
  {
    path: "/analista",
    element: (
      <RequireRole rol="Analista">
        <AnalistaHome />
      </RequireRole>
    ),
  },

  // Catch-all → login
  { path: "*", element: <Navigate to="/login" replace /> },
]);
