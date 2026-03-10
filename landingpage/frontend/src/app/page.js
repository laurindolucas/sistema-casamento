import Mapa from "@/componets/mapa/mapa"
import Countdown from "../componets/countdown/countdown"
import Footer from "@/componets/footer/footer"
import Confirmacao from "@/componets/confirmacao/confirmacao"
import Hero from "@/componets/hero/hero"
import Manual from "@/componets/manual/manual"
import BottomNav from "@/componets/bottomNav/bottomNav"
import Gifts from "@/componets/gifts/gifts"



export default function Home() {
  return (
    <main>
      <Hero/>
      <Mapa/>
      <Confirmacao/>
      <Countdown />
      <Gifts/>
      <Manual/>
      <Footer/>
      <BottomNav />
    </main>
  )
}