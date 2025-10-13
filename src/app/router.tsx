import { createBrowserRouter, Navigate } from "react-router-dom";
import TraderHome from "../pages/trader/Home";
import AdminHome from "../pages/admin/Home";
import AnalistaHome from "../pages/analista/Home";
import Login from "../features/auth/Login";
import Navbar from "../components/Navbar";
import RequireRole from "./RequireRole";
import Profile from "../features/profile/Profile.tsx";

function Layout({ children }: { children: JSX.Element }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/trader",
    element: (
      <RequireRole allowedRoles={["Trader"]}>
        <Layout>
          <TraderHome />
        </Layout>
      </RequireRole>
    ),
  },
  {
    path: "/admin",
    element: (
      <RequireRole allowedRoles={["Admin"]}>
        <Layout>
          <AdminHome />
        </Layout>
      </RequireRole>
    ),
  },
  {
    path: "/analista",
    element: (
      <RequireRole allowedRoles={["Analista"]}>
        <Layout>
          <AnalistaHome />
        </Layout>
      </RequireRole>
    ),
  },
  {
    path: "/perfil",
    element: (
      <RequireRole allowedRoles={["Trader", "Admin", "Analista"]}>
        <Layout>
          <Profile />
        </Layout>
      </RequireRole>
    ),
  },
  { path: "/", element: <Navigate to="/login" replace /> },
]);
