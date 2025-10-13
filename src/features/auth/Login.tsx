import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { usuariosMock } from "../../services/mock";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Si ya hay sesión, redirigir automáticamente
  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      navigate(`/${user.rol.toLowerCase()}`);
    }
  }, [navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Buscar coincidencia
    const user = usuariosMock.find(
      (u) =>
        u.usuario.toLowerCase() === usuario.toLowerCase() &&
        u.contrasena === contrasena
    );

    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
      navigate(`/${user.rol.toLowerCase()}`);
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <div className={styles.container}>
      <h1>Iniciar sesión</h1>

      <form className={styles.form} onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
