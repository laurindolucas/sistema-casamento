import styles from "./mapa.module.css"

export default function Mapa() {
  return (
    <section className={`${styles.mapa}`}>

      <div className={styles.container}>

        <span className={`${styles.tag} animate fade-down`}>
          Celebração
        </span>

        <h2 className={`${styles.title} animate fade-up delay-1`}>
          Nosso Grande Dia
        </h2>

        <div className={`${styles.dateBox} animate fade-up delay-2`}>
          <p className={styles.date}>27 de Setembro de 2026</p>
          <p className={styles.time}>às 15h00</p>
        </div>

        <div className={`${styles.divider} animate fade-up delay-3`}></div>

        <p className={`${styles.date} animate fade-up delay-3`}>
          Espaço Jardim Colonial
        </p>

        <p className={`${styles.location} animate fade-up delay-4`}>
          RUA IRAPUÃ, 370, IPSEP, RECIFE-PE
        </p>

        <a
          className={`${styles.button} animate zoom-in delay-4`}
          href="https://maps.google.com"
          target="_blank"
        >
          <i className="fi fi-sr-map-pin"></i>
          Ver localização
        </a>

        <div className={`${styles.map} animate fade-up delay-5`}>
          <iframe
            src="https://www.google.com/maps?q=recife&output=embed"
            loading="lazy"
          ></iframe>
        </div>

      </div>

    </section>
  )
}