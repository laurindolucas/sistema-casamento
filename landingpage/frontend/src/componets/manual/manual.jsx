import styles from "./manual.module.css"
import {
  FiEdit3,
  FiClock,
  FiMail,
  FiUser,
  FiVolumeX,
  FiHeart,
  FiCamera,
  FiCoffee
} from "react-icons/fi"

export default function Manual() {
  return (
    <section className={styles.manual}>

      <div className={styles.header}>
        <div className={styles.icon}>
          <FiEdit3 />
        </div>
        <h2>Manual do Convidado</h2>
      </div>

      <div className={styles.grid}>

        <div className={styles.item}>
          <FiEdit3 />
          <p>
            Confirme sua presença até o dia 27 de Julho.
          </p>
        </div>

        <div className={styles.item}>
          <FiClock />
          <p>Não se atrase! Seja pontual.</p>
        </div>

        <div className={styles.item}>
          <FiMail />
          <p>Convidado não convida!</p>
        </div>

        <div className={styles.item}>
          <FiUser />
          <p>Branco é a cor da noiva.</p>
        </div>

        <div className={styles.item}>
          <FiVolumeX />
          <p>Deixe seu celular no silencioso.</p>
        </div>

        <div className={styles.item}>
          <FiHeart />
          <p>Não saia sem se despedir.</p>
        </div>

        <div className={styles.item}>
          <FiCamera />
          <p>Não dificulte o trabalho dos fotógrafos.</p>
        </div>

        <div className={styles.item}>
          <FiCoffee />
          <p>Celebre conosco este momento.</p>
        </div>

      </div>

      <p className={styles.obs}>
        Para celebrar conosco em perfeita harmonia, pedimos que seu look
        seja em tons pastéis. O uso é indispensável. Evite cores azul e lilás.
      </p>

      <div className={styles.colors}>
        <span className={styles.c1}></span>
        <span className={styles.c2}></span>
        <span className={styles.c3}></span>
        <span className={styles.c4}></span>
        <span className={styles.c5}></span>
      </div>

    </section>
  )
}