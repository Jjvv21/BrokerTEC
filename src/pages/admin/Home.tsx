import Navbar from "../../components/Navbar";
import styles from "./AdminHome.module.css";

export default function AdminHome() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Panel del Administrador</h1>
        <p>Gestión de usuarios, empresas y mercados.</p>
      </div>
    </>
  );
}
