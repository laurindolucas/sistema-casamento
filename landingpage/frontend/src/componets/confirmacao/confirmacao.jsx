"use client"

import { useState, useEffect } from "react"
import styles from "./confirmacao.module.css"

const API_BASE = "http://localhost:5000/api"

export default function Confirmacao() {
  const [convidados, setConvidados] = useState([])
  const [loadingConvidados, setLoadingConvidados] = useState(true)
  const [valor, setValor] = useState("")
  const [sugestoes, setSugestoes] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [status, setStatus] = useState("idle") // idle | loading | success | error | ja-confirmado

  // Carrega todos os convidados uma vez ao montar
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API_BASE}/confirmacoes?limit=100&page=1`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setConvidados(json.data || [])
      } catch {
        // silencioso — sugestões simplesmente não aparecem
      } finally {
        setLoadingConvidados(false)
      }
    }
    carregar()
  }, [])

  function handleInput(e) {
    const texto = e.target.value
    setValor(texto)
    setSelecionado(null)
    setStatus("idle")

    if (texto.trim().length === 0) {
      setSugestoes([])
      return
    }

    const filtrados = convidados.filter(c =>
      c.nome_convidado.toLowerCase().includes(texto.toLowerCase())
    )
    setSugestoes(filtrados)
  }

  function selecionarNome(convidado) {
    setValor(convidado.nome_convidado)
    setSelecionado(convidado)
    setSugestoes([])
    setStatus("idle")
  }

  async function confirmarPresenca() {
    if (!selecionado) return

    // Já confirmado anteriormente
    if (selecionado.confirmado) {
      setStatus("ja-confirmado")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch(`${API_BASE}/confirmacoes/${selecionado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmado: true }),
      })
      if (!res.ok) throw new Error()

      // Atualiza localmente para refletir o novo estado
      setConvidados(prev =>
        prev.map(c => c.id === selecionado.id ? { ...c, confirmado: true } : c)
      )
      setSelecionado(prev => prev ? { ...prev, confirmado: true } : prev)
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className={styles.confirmacao}>
      <div className={`${styles.card} animate fade-up`}>

        <h2 className={`${styles.titulo} animate fade-down`}>
          Confirme sua Presença
        </h2>

        <p className={`${styles.descricao} animate fade-up delay-1`}>
          Sua presença é muito importante para nós!
          Digite seu nome e confirme sua presença em nosso casamento.
        </p>

        {/* Feedbacks */}
        {status === "success" && (
          <div className={styles.feedbackSucesso}>
            🎉 Presença confirmada! Até logo, <strong>{selecionado?.nome_convidado}</strong>!
          </div>
        )}

        {status === "ja-confirmado" && (
          <div className={styles.feedbackInfo}>
            ✅ Você já confirmou sua presença anteriormente. Até logo!
          </div>
        )}

        {status === "error" && (
          <div className={styles.feedbackErro}>
            ❌ Ocorreu um erro. Tente novamente ou fale com os noivos.
          </div>
        )}

        {/* Formulário — some após sucesso */}
        {status !== "success" && (
          <>
            <div className={`${styles.inputGroup} animate fade-up delay-2`}>
              <input
                type="text"
                placeholder={loadingConvidados ? "Carregando lista..." : "Digite seu nome completo"}
                value={valor}
                onChange={handleInput}
                disabled={loadingConvidados}
                autoComplete="off"
              />

              {sugestoes.length > 0 && (
                <div className={styles.sugestoes}>
                  {sugestoes.map(c => (
                    <div
                      key={c.id}
                      className={styles.sugestaoItem}
                      onClick={() => selecionarNome(c)}
                    >
                      <span>{c.nome_convidado}</span>
                      {c.confirmado && (
                        <span className={styles.jaConfirmado}>✓ já confirmado</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {valor.length > 1 && sugestoes.length === 0 && !loadingConvidados && (
                <div className={styles.semResultado}>
                  Nenhum convidado encontrado com esse nome.
                </div>
              )}
            </div>

            <div className={`${styles.buttons} animate zoom-in delay-3`}>
              <button
                className={`${styles.confirmarBtn} ${selecionado ? styles.ativo : ""}`}
                disabled={!selecionado || status === "loading"}
                onClick={confirmarPresenca}
              >
                {status === "loading" ? "Confirmando..." : "Confirmar Presença"}
              </button>
            </div>
          </>
        )}

      </div>
    </section>
  )
}