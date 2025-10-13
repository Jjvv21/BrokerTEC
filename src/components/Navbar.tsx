import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  function handleLogout() {
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  if (!user) return null;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1f2937", // gris oscuro
        color: "white",
        padding: "12px 32px",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>BrokerTEC</div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Link perfil */}
        <a
          href="/perfil"
          style={{
            color: "#93c5fd",
            textDecoration: "underline",
            marginRight: "40px",
          }}
        >
          Perfil
        </a>

        {/* Nombre + Rol */}
        <span style={{ marginRight: "40px" }}>
          {user.nombre} <span style={{ color: "#9ca3af" }}>({user.rol})</span>
        </span>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
