import styles from "./historia.module.css"

export default function Historia() {
  return (
    <section className={styles.story}>

      <div className={styles.container}>

        <div className={styles.textArea}>

          <span className={styles.tag}>Nossa história</span>

          <h2 className={styles.title}>
            Como tudo começou
          </h2>

          <p className={styles.text}>
            Nossa história começou de forma simples, mas cheia de significado.
            Entre encontros, risadas e sonhos compartilhados,
            descobrimos que o amor é a nossa maior jornada.
          </p>

          <p className={styles.text}>
            Agora queremos celebrar esse momento ao lado das
            pessoas que fazem parte da nossa história e que
            fizeram cada passo dessa caminhada ser ainda mais especial.
          </p>

        </div>

        <div className={styles.imageArea}>
          <img
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486"
            alt="casal"
          />
        </div>

      </div>

    </section>
  )
}