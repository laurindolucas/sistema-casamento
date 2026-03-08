"use client"

import { useState } from "react"
import styles from "./confirmacao.module.css"

export default function Confirmacao() {

  const convidados = [
    "Carlos Henrique Almeida",
    "Carla Helena Souza",
    "Camila Andrade Lima",
    "Hugo Martins Pereira",
    "Helena Costa Oliveira",
    "João Pedro Ramos",
    "Mariana Albuquerque"
  ]

  const [valor, setValor] = useState("")
  const [sugestoes, setSugestoes] = useState([])
  const [nomeSelecionado, setNomeSelecionado] = useState("")

  function handleInput(e) {

    const texto = e.target.value
    setValor(texto)

    if (texto.length === 0) {
      setSugestoes([])
      setNomeSelecionado("")
      return
    }

    const filtrados = convidados.filter(nome =>
      nome.toLowerCase().includes(texto.toLowerCase())
    )

    setSugestoes(filtrados)

  }

  function selecionarNome(nome) {
    setValor(nome)
    setNomeSelecionado(nome)
    setSugestoes([])
  }

  function confirmarPresenca() {

    if (!nomeSelecionado) return

    alert("Presença confirmada para: " + nomeSelecionado)

    // depois você vai chamar sua API Flask aqui
  }

  return (

    <section className={styles.confirmacao}>

      <div className={styles.card}>

        <h2 className={styles.titulo}>
          Confirme sua Presença
        </h2>

        <p className={styles.descricao}>
          Sua presença é muito importante para nós!
          Digite seu nome e confirme sua presença em nosso casamento.
        </p>

        <div className={styles.inputGroup}>

          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={valor}
            onChange={handleInput}
          />

          {sugestoes.length > 0 && (
            <div className={styles.sugestoes}>
              {sugestoes.map((nome, index) => (
                <div
                  key={index}
                  className={styles.sugestaoItem}
                  onClick={() => selecionarNome(nome)}
                >
                  {nome}
                </div>
              ))}
            </div>
          )}

        </div>

        <div className={styles.buttons}>

          <button
            className={`${styles.confirmarBtn} ${nomeSelecionado ? styles.ativo : ""}`}
            disabled={!nomeSelecionado}
            onClick={confirmarPresenca}
          >
            Confirmar Presença
          </button>

        </div>

      </div>

    </section>
  )
}