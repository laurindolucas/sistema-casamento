import styles from "./footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>

      <div className={styles.container}>

        <h3 className={styles.names}>
          Angel & Gabriel
        </h3>

        <p className={styles.message}>
          Obrigado por fazer parte da nossa história.
          Estamos ansiosos para celebrar esse momento especial com você.
        </p>

        <div className={styles.divider}></div>

        <p className={styles.copy}>
          © 2026 Angel & Gabriel
        </p>

        <p className={styles.dev}>
          Site desenvolvido por <span>Caio Laurindo</span>
        </p>

      </div>

    </footer>
  )
}