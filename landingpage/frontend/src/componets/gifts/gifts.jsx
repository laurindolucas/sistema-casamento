import styles from "./gifts.module.css"
import { FaGift, FaHeart, FaGlassCheers } from "react-icons/fa"

export default function Gifts() {
  return (
    <section className={styles.gifts} id="presentes">

      <div className={styles.container}>

        <div className={styles.header}>
          <h2 className={styles.title}>Lista de Presentes</h2>
        </div>

        <p className={styles.description}>
          Queridos amigos e familiares, como já dividimos o mesmo teto,
          nossa casa já está quase toda montada. Criamos então um espaço
          para que vocês possam nos presentear de forma simples e divertida.
        </p>

        <div className={styles.cards}>

          <div className={styles.card}>
            <FaGift />
            <h3>Escolha um presente</h3>
            <p>
              Você pode escolher uma cota simbólica ou um presente que
              ajude a completar nosso novo lar.
            </p>
          </div>

          <div className={styles.card}>
            <FaGlassCheers />
            <h3>Lembranças da Lua de Mel</h3>
            <p>
              Também é possível patrocinar momentos especiais da nossa
              viagem de lua de mel.
            </p>
          </div>

          <div className={styles.card}>
            <FaHeart />
            <h3>Contribua com carinho</h3>
            <p>
              O valor vai direto para construirmos nossos próximos
              capítulos juntos.
            </p>
          </div>

        </div>

        <p className={styles.message}>
          É tudo muito simples: escolha uma cota, divirta-se com as
          descrições e contribua via PIX ou diretamente pelo link
          da loja. Muito obrigado por fazerem parte da nossa vida!
        </p>

        <a
          className={styles.button}
          href="https://site-da-lista.com"
          target="_blank"
        >
          Ver lista completa de presentes
        </a>

      </div>

    </section>
  )
}