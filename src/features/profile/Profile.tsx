import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import styles from "./Profile.module.css";

export default function Profile() {
  const [usuario, setUsuario] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (!stored) {
      navigate("/login");
    } else {
      setUsuario(JSON.parse(stored));
    }
  }, [navigate]);

  if (!usuario) return null;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Perfil de Usuario</h1>
        <div className={styles.card}>
          <p><strong>Alias:</strong> {usuario.alias}</p>
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono}</p>
          <p><strong>País:</strong> {usuario.pais}</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
          <p><strong>Wallet:</strong> {usuario.wallet}</p>
          <p><strong>Estado:</strong> {usuario.estado}</p>
        </div>
      </div>
    </>
  );
}
