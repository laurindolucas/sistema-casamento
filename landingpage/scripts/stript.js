const convidados = [
  "Carlos Henrique Almeida",
  "Carla Helena Souza",
  "Camila Andrade Lima",
  "Hugo Martins Pereira",
  "Helena Costa Oliveira",
  "João Pedro Ramos",
  "Mariana Albuquerque"
];

const input = document.getElementById("nomeInput");
const sugestoesBox = document.getElementById("sugestoes");
const confirmarBtn = document.getElementById("confirmarBtn");

let nomeSelecionado = "";

input.addEventListener("input", function () {
  const valor = this.value.toLowerCase();
  sugestoesBox.innerHTML = "";

  if (valor.length === 0) {
    sugestoesBox.style.display = "none";
    confirmarBtn.disabled = true;
    confirmarBtn.classList.remove("ativo");
    return;
  }

  const filtrados = convidados.filter(nome =>
    nome.toLowerCase().includes(valor)
  );

  if (filtrados.length === 0) {
    sugestoesBox.style.display = "none";
    return;
  }

  filtrados.forEach(nome => {
    const div = document.createElement("div");
    div.classList.add("sugestao-item");
    div.textContent = nome;

    div.addEventListener("click", function () {
      input.value = nome;
      nomeSelecionado = nome;
      sugestoesBox.style.display = "none";
      confirmarBtn.disabled = false;
      confirmarBtn.classList.add("ativo");
    });

    sugestoesBox.appendChild(div);
  });

  sugestoesBox.style.display = "block";
});

confirmarBtn.addEventListener("click", function () {
  if (!nomeSelecionado) return;

  alert("Presença confirmada para: " + nomeSelecionado);
});


const dataEvento = new Date("December 20, 2026 16:00:00").getTime();

const diasEl = document.getElementById("dias");
const horasEl = document.getElementById("horas");
const minutosEl = document.getElementById("minutos");
const segundosEl = document.getElementById("segundos");

function atualizarContagem() {
  const agora = new Date().getTime();
  const diferenca = dataEvento - agora;

  if (diferenca <= 0) {
    diasEl.textContent = "00";
    horasEl.textContent = "00";
    minutosEl.textContent = "00";
    segundosEl.textContent = "00";
    return;
  }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferenca / 1000 / 60) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);

  atualizarElemento(diasEl, dias);
  atualizarElemento(horasEl, horas);
  atualizarElemento(minutosEl, minutos);
  atualizarElemento(segundosEl, segundos);
}

function atualizarElemento(elemento, valor) {
  if (elemento.textContent != valor) {
    elemento.classList.add("animate");
    elemento.textContent = valor.toString().padStart(2, "0");

    setTimeout(() => {
      elemento.classList.remove("animate");
    }, 300);
  }
}

setInterval(atualizarContagem, 1000);
atualizarContagem();