import styles from "./mapa.module.css"

export default function Mapa() {
  return (
    <section className={styles.mapa}>

      <div className={styles.container}>

        <span className={styles.tag}>Celebração</span>

        <h2 className={styles.title}>Nosso Grande Dia</h2>

        <div className={styles.dateBox}>
          <p className={styles.date}>27 de Setembro de 2026</p>
          <p className={styles.time}>às 15h00</p>
        </div>

        <div className={styles.divider}></div>

        <p className={styles.location}>
          RUA IRAPUÃ, 370, IPSEP, RECIFE-PE
        </p>

        <a
          className={styles.button}
          href="https://maps.google.com"
          target="_blank"
        >
          <i className="fi fi-sr-map-pin"></i>
          Ver localização
        </a>

        <div className={styles.map}>
          <iframe
            src="https://www.google.com/maps?q=recife&output=embed"
            loading="lazy"
          ></iframe>
        </div>

      </div>

    </section>
  )
}