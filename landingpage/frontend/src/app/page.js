import Mapa from "@/componets/mapa/mapa"
import Countdown from "../componets/countdown/countdown"
import Historia from "../componets/historia/historia"
import Footer from "@/componets/footer/footer"
import Confirmacao from "@/componets/confirmacao/confirmacao"
import Hero from "@/componets/hero/hero"
import Manual from "@/componets/manual/manual"
export default function Home() {
  return (
    <main>
      <Hero/>
      <Historia />
      <Confirmacao/>
      <Mapa/>
      <Countdown />
      <Manual/>
      <Footer/>
    </main>
  )
}