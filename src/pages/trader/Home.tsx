import styles from "./Home.module.css";
import Navbar from "../../components/Navbar";

export default function TraderHome() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1>Bienvenido, Trader 👋</h1>
        <p>Panel de control y operaciones próximamente...</p>
      </div>
    </>
  );
}
