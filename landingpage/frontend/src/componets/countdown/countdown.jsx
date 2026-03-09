"use client"

import { useState, useEffect } from "react"
import styles from "./countdown.module.css"

export default function Countdown() {

      const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=Casamento+Angélica+e+Gabriel" +
    "&dates=20260927T150000/20260927T230000" +
    "&details=Venha+celebrar+conosco+nosso+casamento!" +
    "&location=Cidade+Estado";

    const dataCasamento = new Date("sep 27, 2026 15:00:00").getTime()

    const [tempo, setTempo] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0
    })

    useEffect(() => {

        const interval = setInterval(() => {

            const agora = new Date().getTime()
            const distancia = dataCasamento - agora

            const dias = Math.floor(distancia / (1000 * 60 * 60 * 24))
            const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60))
            const segundos = Math.floor((distancia % (1000 * 60)) / 1000)

            setTempo({
                dias,
                horas,
                minutos,
                segundos
            })

        }, 1000)

        return () => clearInterval(interval)

    }, [])

    return (
        <section className={styles.countdown}>

            <h2 className={styles.countdownTitle}>Falta pouco!</h2>

            <p className={styles.countdownSubtitle}>
                Estamos contando os dias para o nosso grande dia.
                Cada momento que passa nos aproxima do tão esperado “sim”.
            </p>

            <div className={styles.countdownGrid}>

                <div className={styles.timeBox}>
                    <span>{tempo.dias}</span>
                    <small>Dias</small>
                </div>

                <div className={styles.timeBox}>
                    <span>{tempo.horas}</span>
                    <small>Horas</small>
                </div>

                <div className={styles.timeBox}>
                    <span>{tempo.minutos}</span>
                    <small>Minutos</small>
                </div>

                <div className={styles.timeBox}>
                    <span>{tempo.segundos}</span>
                    <small>Segundos</small>
                </div>

            </div>
            <a className={styles.button} href={url} target="_blank" rel="noopener noreferrer" >
                <button>
                    Adicionar à Agenda
                </button>
            </a>


        </section>
    )
}