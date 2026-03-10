const API = "http://localhost:5000/api/presentes"

const tabela = document.getElementById("tabelaPresentes")

async function carregarPresentes(){

const res = await fetch(`${API}?limit=100&page=1`)
const dados = await res.json()

tabela.innerHTML=""

dados.data.forEach(p => {

const status = p.disponivel
? `<span class="disponivel">Disponível</span>`
: `<span class="reservado">Reservado</span>`

const tr = document.createElement("tr")

tr.innerHTML = `
<td>${p.nome_presente}</td>
<td>${p.categoria}</td>
<td>R$ ${p.valor}</td>
<td>${status}</td>

<td>

<button class="info" onclick="info(${p.id})">Info</button>

<button class="edit" onclick="abrirEditar(${p.id})">Editar</button>

<button class="delete" onclick="excluir(${p.id})">Excluir</button>

</td>
`

tabela.appendChild(tr)

})

}

async function info(id){

const res = await fetch(`${API}/${id}`)
const p = await res.json()

const div = document.getElementById("infoReserva")

if(!p.reservado_por){

div.innerHTML = "Presente não reservado"

}else{

const r = p.reservado_por

div.innerHTML = `

<p><b>Nome:</b> ${r.nome_convidado}</p>

<p><b>Email:</b> ${r.email_convidado}</p>

<p><b>Telefone:</b> ${r.telefone_convidado}</p>

<p><b>Mensagem:</b> ${r.mensagem}</p>

`
}

abrirModal("modalInfo")

}

async function abrirEditar(id){

const res = await fetch(`${API}/${id}`)
const p = await res.json()

document.getElementById("edit_id").value = p.id
document.getElementById("edit_nome").value = p.nome_presente
document.getElementById("edit_descricao").value = p.descricao
document.getElementById("edit_valor").value = p.valor
document.getElementById("edit_categoria").value = p.categoria
document.getElementById("edit_pagamento").value = p.tipo_pagamento
document.getElementById("edit_imagem").value = p.url_image
document.getElementById("edit_quantidade").value = p.quantidade_total

abrirModal("modalEditar")

}

document.getElementById("formEditar").addEventListener("submit", async function(e){

e.preventDefault()

const id = document.getElementById("edit_id").value

const body = {

nome_presente: document.getElementById("edit_nome").value,

descricao: document.getElementById("edit_descricao").value,

valor: parseFloat(document.getElementById("edit_valor").value),

categoria: document.getElementById("edit_categoria").value,

tipo_pagamento: document.getElementById("edit_pagamento").value,

url_image: document.getElementById("edit_imagem").value,

quantidade_total: parseInt(document.getElementById("edit_quantidade").value)

}

await fetch(`${API}/${id}`,{

method:"PATCH",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(body)

})

fecharModal("modalEditar")

carregarPresentes()

})

async function excluir(id){

if(!confirm("Deseja excluir este presente?")) return

await fetch(`${API}/${id}`,{
method:"DELETE"
})

carregarPresentes()

}

function abrirModal(id){

document.getElementById(id).style.display="block"

}

function fecharModal(id){

document.getElementById(id).style.display="none"

}

window.onclick = function(event){

document.querySelectorAll(".modal").forEach(m => {

if(event.target == m){

m.style.display="none"

}

})

}

carregarPresentes()