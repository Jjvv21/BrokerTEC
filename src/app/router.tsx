import { createBrowserRouter } from "react-router-dom";
import TraderHome from "../pages/trader/Home";
import AdminHome from "../pages/admin/Home";
import AnalistaHome from "../pages/analista/Home";

function Root() {
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Bienvenido a BrokerTEC</h1>
            <p>Elige tu rol:</p>
            <ul>
                <li><a href="/trader">Trader</a></li>
                <li><a href="/admin">Admin</a></li>
                <li><a href="/analista">Analista</a></li>
            </ul>
        </div>
    );
}

export const router = createBrowserRouter([
    { path: "/", element: <Root /> },
    { path: "/trader", element: <TraderHome /> },
    { path: "/admin", element: <AdminHome /> },
    { path: "/analista", element: <AnalistaHome /> },
]);