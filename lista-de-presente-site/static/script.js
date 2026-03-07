
function abrirModal(botao){

const modal = document.getElementById("modal-presente")

document.getElementById("modal-img").src = botao.dataset.imagem
document.getElementById("modal-nome").innerText = botao.dataset.nome
document.getElementById("modal-preco").innerText = "R$ " + botao.dataset.preco
document.getElementById("pix-chave").value = botao.dataset.pix
document.getElementById("btn-amazon").onclick = () => {
window.open(botao.dataset.amazon)
}

document.getElementById("presente-id").value = botao.dataset.id

modal.style.display = "flex"

}

function fecharModal(){
document.getElementById("modal-presente").style.display="none"
}

function copiarPix(){

const pix = document.getElementById("pix-chave")

pix.select()

document.execCommand("copy")

alert("Chave PIX copiada!")

}

document
.getElementById("form-reserva")
.addEventListener("submit", async function(e){

e.preventDefault()

const id = document.getElementById("presente-id").value
const nome = document.getElementById("nome").value
const telefone = document.getElementById("telefone").value

const res = await fetch(`/api/presentes/${id}/reservar`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
nome_convidado:nome,
telefone_convidado:telefone
})

})

const data = await res.json()

alert("Reserva realizada!")

location.reload()

})