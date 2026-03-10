import styles from "./manual.module.css"
import {
  FiEdit3,
  FiClock,
  FiMail,
  FiVolumeX,
  FiHeart,
  FiCamera,
} from "react-icons/fi"
import { FaGlassCheers } from "react-icons/fa"
import { GiDiamondRing } from "react-icons/gi";

export default function Manual() {
  return (
    <section className={styles.manual}>

      <div className={`${styles.header} animate fade-down`}>
        <div className={`${styles.icon} animate zoom-in`}>
          <FiEdit3 />
        </div>
        <h2 className="animate fade-up delay-1">Manual do Convidado</h2>
      </div>

      <div className={styles.grid}>

        <div className={`${styles.item} animate fade-up delay-1`}>
          <FiEdit3 />
          <p>
            Confirme sua presença até o dia 27 de Julho.
          </p>
        </div>

        <div className={`${styles.item} animate fade-up delay-2`}>
          <FiClock />
          <p>Não se atrase! Seja pontual.</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-3`}>
          <FiMail />
          <p>Convidado não convida!</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-4`}>
          <GiDiamondRing />
          <p>Branco é a cor da noiva.</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-1`}>
          <FiVolumeX />
          <p>Deixe seu celular no silencioso.</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-2`}>
          <FiHeart />
          <p>Não saia sem se despedir.</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-3`}>
          <FiCamera />
          <p>Não dificulte o trabalho dos fotógrafos.</p>
        </div>

        <div className={`${styles.item} animate fade-up delay-4`}>
          <FaGlassCheers/>
          <p>Celebre conosco este momento.</p>
        </div>

      </div>

      <p className={`${styles.obs} animate fade-up delay-3`}>
        Para celebrar conosco em perfeita harmonia, pedimos que seu look
        seja em tons pastéis. O uso é indispensável. Evite cores azul e lilás.
      </p>

      <div className={`${styles.colors} animate fade-up delay-4`}>
        <span className={styles.c1}></span>
        <span className={styles.c2}></span>
        <span className={styles.c3}></span>
        <span className={styles.c4}></span>
        <span className={styles.c5}></span>
      </div>

    </section>
  )
}