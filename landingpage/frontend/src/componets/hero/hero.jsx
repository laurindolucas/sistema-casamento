import styles from "./hero.module.css"

export default function Hero() {
  return (

    <section className={styles.hero}>

      <div className={styles.overlay}></div>

      <img
        src="/assets/image/heroimage.png"
        alt="Foto do casal"
        className={styles.heroImage}
      />

      <div className={styles.content}>

        <p className={styles.topo}>
          Com a bênção de Deus e de seus pais
          <br />
          <strong>Angélica e Gabriel</strong>
          <br />
          convidam você para o seu casamento
        </p>

        <h1 className={styles.monograma}>
          A <span>&</span> G
        </h1>

        <p className={styles.versiculo}>
          "O amor é paciente, o amor é bondoso... tudo sofre, tudo crê,
          tudo espera, tudo suporta."
          <br />
          <span>1 Coríntios 13:4-7</span>
        </p>

        <div className={styles.data}>

          <div className={styles.lado}>
            <span className={styles.linha}></span>
            <p>Domingo</p>
            <span className={styles.linha}></span>
          </div>

          <div className={styles.numero}>
            27
          </div>

          <div className={styles.lado}>
            <span className={styles.linha}></span>
            <p>Às 15:00</p>
            <span className={styles.linha}></span>
          </div>

        </div>

        <p className={styles.mes}>
          Setembro
        </p>

      </div>

    </section>

  )
}