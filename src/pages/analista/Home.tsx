import Navbar from "../../components/Navbar";
import styles from "./AnalistaHome.module.css";

export default function AnalistaHome() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Panel del Analista</h1>
        <p>Visualización de datos, gráficos y reportes.</p>
      </div>
    </>
  );
}
