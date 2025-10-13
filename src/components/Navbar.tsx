import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  function handleLogout() {
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  if (!user) return null;

  // 🔹 opciones personalizadas por rol
  const menuPorRol: Record<string, string[]> = {
    Trader: ["Operaciones"],
    Admin: ["Gestión"],
    Analista: ["Reportes"],
  };

  const opciones = menuPorRol[user.rol] || [];

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>BrokerTEC</div>

      <div className={styles.links}>
        <a href="/perfil" className={styles.link}>Perfil</a>

        {opciones.map((opcion) => (
          <a
            key={opcion}
            href={`/${user.rol.toLowerCase()}/${opcion.toLowerCase()}`}
            className={styles.link}
          >
            {opcion}
          </a>
        ))}

        <span className={styles.user}>
          {user.nombre} <span className={styles.rol}>({user.rol})</span>
        </span>

        <button onClick={handleLogout} className={styles.logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
