import styles from "./bottomNav.module.css"
import { FiHome, FiCheckCircle, FiGift, FiMapPin } from "react-icons/fi"

export default function BottomNav() {
  return (
    <nav className={styles.nav}>

      <a href="#inicio" className={styles.item}>
        <FiHome />
        <span>Início</span>
      </a>

      <a href="#confirmacao" className={styles.item}>
        <FiCheckCircle />
        <span>Confirmar</span>
      </a>

      <a href="#presentes" className={styles.item}>
        <FiGift />
        <span>Presentes</span>
      </a>

      <a href="#localizacao" className={styles.item}>
        <FiMapPin />
        <span>Local</span>
      </a>

    </nav>
  )
}