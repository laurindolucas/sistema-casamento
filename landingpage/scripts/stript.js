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

const dataCasamento = new Date("Dec 20, 2026 16:00:00").getTime();

setInterval(()=>{

const agora = new Date().getTime();

const distancia = dataCasamento - agora;

const dias = Math.floor(distancia/(1000*60*60*24));
const horas = Math.floor((distancia%(1000*60*60*24))/(1000*60*60));
const minutos = Math.floor((distancia%(1000*60*60))/(1000*60));
const segundos = Math.floor((distancia%(1000*60))/1000);

document.getElementById("dias").innerText=dias;
document.getElementById("horas").innerText=horas;
document.getElementById("minutos").innerText=minutos;
document.getElementById("segundos").innerText=segundos;

},1000);