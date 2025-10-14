import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/Login";
import Profile from "../features/profile/Profile";
import TraderHome from "../pages/trader/Home";
import AdminHome from "../pages/admin/Home";
import AnalistaHome from "../pages/analista/Home";
import RequireRole from "./RequireRole";
import Layout from "./Layout";
import EmpresaDetalle from "../pages/trader/EmpresaDetalle";
import Operar from "../pages/trader/Operar";
import Wallet from "../pages/trader/Wallet";
import Portafolio from "../pages/trader/Portafolio";
import Seguridad from "../pages/trader/Seguridad";
import Usuarios from "../pages/admin/Usuarios";
import Empresas from "../pages/admin/Empresas";
import Precios from "../pages/admin/Precios";
import EmpresaReportes from "../pages/analista/EmpresaReportes";
import UsuarioReportes from "../pages/analista/UsuarioReportes";
import Estadisticas from "../pages/analista/Estadisticas";


export const router = createBrowserRouter([
  // 🔹 Página de login
  { path: "/login", element: <Login /> },
  { path: "/", element: <Login /> },
  {
    path: "/trader/empresa/:id",
    element: (
      <RequireRole rol="Trader">
        <EmpresaDetalle />
      </RequireRole>
    ),
  },







  // 🔹 Sección protegida (usa el Layout con Navbar)
  {
    element: <Layout />, // ✅ Navbar se renderiza solo aquí
    children: [
      {
        path: "/perfil",
        element: <Profile />,
      },
      {
        path: "/trader",
        element: (
          <RequireRole rol="Trader">
            <TraderHome />
          </RequireRole>
        ),
      },

      {
        path: "/trader/operar/:id",
        element: (
          <RequireRole rol="Trader">
            <Operar />
          </RequireRole>
        ),
      },
      {
        path: "/trader/wallet",
        element: (
          <RequireRole rol="Trader">
            <Wallet />
          </RequireRole>
        ),
      },
      {
        path: "/trader/portafolio",
        element: (
          <RequireRole rol="Trader">
            <Portafolio />
          </RequireRole>
        ),
      },
      {
        path: "/trader/seguridad",
        element: (
          <RequireRole rol="Trader">
            <Seguridad />
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
        path: "/admin/usuarios",
        element: (
          <RequireRole rol="Admin">
            <Usuarios />
          </RequireRole>
        ),
      },
      {
        path: "/admin/empresas",
        element: (
          <RequireRole rol="Admin">
            <Empresas />
          </RequireRole>
        ),
      },
      {
        path: "/admin/precios",
        element: (
          <RequireRole rol="Admin">
            <Precios />
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
      {
        path: "/analista/empresa",
        element: (
          <RequireRole rol="Analista">
            <EmpresaReportes />
          </RequireRole>
        ),
      },
      {
        path: "/analista/usuario",
        element: (
          <RequireRole rol="Analista">
            <UsuarioReportes />
          </RequireRole>
        ),
      },
      {
        path: "/analista/estadisticas",
        element: (
          <RequireRole rol="Analista">
            <Estadisticas />
          </RequireRole>
        ),
      },

    ],
  },
]);
