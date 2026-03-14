const API_BASE = "http://localhost:5000/api"
const API_PRESENTES = `${API_BASE}/presentes`
const API_CONFIRMACOES = `${API_BASE}/confirmacoes`

// ══════════════════════════════════════════
//  ESTADO GLOBAL
// ══════════════════════════════════════════
const state = {
  presentes: { page: 1, limit: 50, busca: "", categoria: "", status: "" },
  convidados: { page: 1, limit: 100, busca: "", confirmado: "" },
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
function toast(msg, duracao = 2800) {
  const el = document.getElementById("toast")
  el.textContent = msg
  el.classList.add("show")
  setTimeout(() => el.classList.remove("show"), duracao)
}

// ══════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════
function abrirModal(id) {
  document.getElementById(id).classList.add("open")
}
function fecharModal(id) {
  document.getElementById(id).classList.remove("open")
}

window.addEventListener("click", e => {
  document.querySelectorAll(".modal.open").forEach(m => {
    if (e.target === m) fecharModal(m.id)
  })
})

// ══════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"))
    document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"))
    btn.classList.add("active")
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active")
    if (btn.dataset.tab === "convidados") carregarConvidados()
  })
})

// ══════════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════════
function fmtMoeda(val) {
  return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function fmtData(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function renderPaginacao(containerId, currentPage, total, limit, onPage) {
  const totalPages = Math.ceil(total / limit) || 1
  const el = document.getElementById(containerId)
  el.innerHTML = ""

  if (totalPages <= 1) return

  const prev = document.createElement("button")
  prev.className = "page-btn"
  prev.textContent = "← Anterior"
  prev.disabled = currentPage <= 1
  prev.addEventListener("click", () => onPage(currentPage - 1))
  el.appendChild(prev)

  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement("button")
    b.className = "page-btn" + (i === currentPage ? " active" : "")
    b.textContent = i
    b.addEventListener("click", () => onPage(i))
    el.appendChild(b)
  }

  const next = document.createElement("button")
  next.className = "page-btn"
  next.textContent = "Próximo →"
  next.disabled = currentPage >= totalPages
  next.addEventListener("click", () => onPage(currentPage + 1))
  el.appendChild(next)
}

function tabelaCarregando(tbodyId, cols) {
  const tbody = document.getElementById(tbodyId)
  tbody.innerHTML = `<tr class="state-row"><td colspan="${cols}"><span class="spinner"></span>Carregando…</td></tr>`
}

function tabelaVazia(tbodyId, cols, msg = "Nenhum item encontrado.") {
  const tbody = document.getElementById(tbodyId)
  tbody.innerHTML = `<tr class="state-row"><td colspan="${cols}">${msg}</td></tr>`
}

// ══════════════════════════════════════════
//  ── PRESENTES ──
// ══════════════════════════════════════════
async function carregarPresentes() {
  tabelaCarregando("tabelaPresentes", 6)

  const { page, limit, busca, categoria, status } = state.presentes
  const params = new URLSearchParams({ page, limit })
  if (busca)         params.set("busca", busca)
  if (categoria)     params.set("categoria", categoria)
  if (status !== "") params.set("somente_disponiveis", status)

  let dados
  try {
    const res = await fetch(`${API_PRESENTES}?${params}`)
    if (!res.ok) throw new Error(res.status)
    dados = await res.json()
  } catch {
    tabelaVazia("tabelaPresentes", 6, "Erro ao conectar com a API.")
    return
  }

  const lista = dados.data || []
  atualizarStatsPresentes(lista, dados.count)
  popularCategorias(lista)
  renderTabelaPresentes(lista)
  renderPaginacao("paginacaoPresentes", page, dados.count, limit, p => {
    state.presentes.page = p
    carregarPresentes()
  })
}

// ── Stats (sem valor total) ──
function atualizarStatsPresentes(lista, total) {
  const disponiveis = lista.filter(p => p.disponivel).length
  const reservados  = lista.filter(p => !p.disponivel).length
  document.getElementById("stat-total").textContent = total ?? lista.length
  document.getElementById("stat-disp").textContent  = disponiveis
  document.getElementById("stat-res").textContent   = reservados
}

// ── Popular select de categorias ──
function popularCategorias(lista) {
  const sel = document.getElementById("filtro-categoria")
  const atual = sel.value
  const cats = [...new Set(lista.map(p => p.categoria).filter(Boolean))]
  sel.innerHTML = `<option value="">Todas as categorias</option>`
  cats.forEach(c => {
    const o = document.createElement("option")
    o.value = c
    o.textContent = c
    if (c === atual) o.selected = true
    sel.appendChild(o)
  })
}

// ── Renderizar tabela ──
function renderTabelaPresentes(lista) {
  const tbody = document.getElementById("tabelaPresentes")

  if (!lista.length) {
    tabelaVazia("tabelaPresentes", 6)
    return
  }

  tbody.innerHTML = ""
  lista.forEach(p => {
    const badge = p.disponivel
      ? `<span class="badge badge-disponivel">Disponível</span>`
      : `<span class="badge badge-reservado">Reservado</span>`

    const img = p.url_image
      ? `<img class="gift-thumb" src="${p.url_image}" alt="${p.nome_presente}" onerror="this.style.display='none'">`
      : ""

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td><div class="gift-name-cell">${img}<span>${p.nome_presente}</span></div></td>
      <td>${p.categoria || "—"}</td>
      <td>${fmtMoeda(p.valor)}</td>
      <td>${p.tipo_pagamento || "—"}</td>
      <td>${badge}</td>
      <td>
        <div class="actions">
          <button class="btn-icon" onclick="verInfoReserva(${p.id})">🔍 Info</button>
          <button class="btn-icon" onclick="abrirEditar(${p.id})">✏️ Editar</button>
          <button class="btn-icon danger" onclick="excluirPresente(${p.id})">🗑️ Excluir</button>
        </div>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ══════════════════════════════════════════
//  MODAL INFO RESERVA
// ══════════════════════════════════════════
async function verInfoReserva(id) {
  const div = document.getElementById("infoReserva")
  div.innerHTML = `<p style="text-align:center;color:#aaa"><span class="spinner"></span>Carregando…</p>`
  abrirModal("modalInfo")

  try {
    const res = await fetch(`${API_PRESENTES}/${id}`)
    const p   = await res.json()

    if (!p.reservado_por) {
      div.innerHTML = `<div class="empty-info">Este presente ainda não foi reservado.</div>`
      return
    }

    const r = p.reservado_por
    div.innerHTML = `
      <div class="info-grid">
        <div class="info-item">
          <label>Nome</label>
          <div class="val">${r.nome_convidado || "—"}</div>
        </div>
        <div class="info-item">
          <label>E-mail</label>
          <div class="val">${r.email_convidado || "—"}</div>
        </div>
        <div class="info-item">
          <label>Telefone</label>
          <div class="val">${r.telefone_convidado || "—"}</div>
        </div>
        <div class="info-item">
          <label>Data da Reserva</label>
          <div class="val">${fmtData(r.criado_em)}</div>
        </div>
        ${r.mensagem ? `<div class="info-item info-msg" style="grid-column:1/-1">"${r.mensagem}"</div>` : ""}
      </div>
    `
  } catch {
    div.innerHTML = `<div class="empty-info">Erro ao carregar informações.</div>`
  }
}

// ══════════════════════════════════════════
//  MODAL EDITAR PRESENTE (pré-preenchido)
// ══════════════════════════════════════════
async function abrirEditar(id) {
  try {
    const res = await fetch(`${API_PRESENTES}/${id}`)
    const p   = await res.json()

    document.getElementById("edit_id").value         = p.id
    document.getElementById("edit_nome").value       = p.nome_presente    || ""
    document.getElementById("edit_descricao").value  = p.descricao        || ""
    document.getElementById("edit_valor").value      = p.valor            ?? ""
    document.getElementById("edit_categoria").value  = p.categoria        || ""
    document.getElementById("edit_pagamento").value  = p.tipo_pagamento   || ""
    document.getElementById("edit_imagem").value     = p.url_image        || ""
    document.getElementById("edit_quantidade").value = p.quantidade_total ?? 1

    abrirModal("modalEditar")
  } catch {
    toast("❌ Erro ao carregar presente.")
  }
}

document.getElementById("formEditar").addEventListener("submit", async function (e) {
  e.preventDefault()
  const id = document.getElementById("edit_id").value

  const body = {
    nome_presente:    document.getElementById("edit_nome").value,
    descricao:        document.getElementById("edit_descricao").value,
    valor:            parseFloat(document.getElementById("edit_valor").value),
    categoria:        document.getElementById("edit_categoria").value,
    tipo_pagamento:   document.getElementById("edit_pagamento").value,
    url_image:        document.getElementById("edit_imagem").value,
    quantidade_total: parseInt(document.getElementById("edit_quantidade").value),
  }

  try {
    const res = await fetch(`${API_PRESENTES}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error()
    fecharModal("modalEditar")
    toast("✅ Presente atualizado com sucesso!")
    carregarPresentes()
  } catch {
    toast("❌ Erro ao salvar alterações.")
  }
})

// ══════════════════════════════════════════
//  EXCLUIR PRESENTE
// ══════════════════════════════════════════
async function excluirPresente(id) {
  if (!confirm("Deseja realmente excluir este presente?")) return

  try {
    const res = await fetch(`${API_PRESENTES}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error()
    toast("🗑️ Presente excluído.")
    // Se era o último item da página atual, volta uma página
    const linhas = document.querySelectorAll("#tabelaPresentes tr:not(.state-row)").length
    if (linhas === 1 && state.presentes.page > 1) state.presentes.page--
    carregarPresentes()
  } catch {
    toast("❌ Erro ao excluir presente.")
  }
}

// ══════════════════════════════════════════
//  FILTROS — PRESENTES
// ══════════════════════════════════════════
let debouncePresente
document.getElementById("busca-presente").addEventListener("input", e => {
  clearTimeout(debouncePresente)
  debouncePresente = setTimeout(() => {
    state.presentes.busca = e.target.value
    state.presentes.page  = 1
    carregarPresentes()
  }, 400)
})

document.getElementById("filtro-categoria").addEventListener("change", e => {
  state.presentes.categoria = e.target.value
  state.presentes.page = 1
  carregarPresentes()
})

document.getElementById("filtro-status").addEventListener("change", e => {
  state.presentes.status = e.target.value
  state.presentes.page = 1
  carregarPresentes()
})

// ══════════════════════════════════════════
//  ── CONVIDADOS ──
// ══════════════════════════════════════════
async function carregarConvidados() {
  tabelaCarregando("tabelaConvidados", 4)

  const { page, limit, busca, confirmado } = state.convidados
  const params = new URLSearchParams({ page, limit })
  if (busca)             params.set("busca", busca)
  if (confirmado !== "") params.set("confirmado", confirmado)

  let dados
  try {
    const res = await fetch(`${API_CONFIRMACOES}?${params}`)
    if (!res.ok) throw new Error(res.status)
    dados = await res.json()
  } catch {
    tabelaVazia("tabelaConvidados", 4, "Erro ao conectar com a API.")
    return
  }

  const lista = dados.data || []
  atualizarStatsConvidados(lista, dados.count)
  renderTabelaConvidados(lista)
  renderPaginacao("paginacaoConvidados", page, dados.count, limit, p => {
    state.convidados.page = p
    carregarConvidados()
  })
}

function atualizarStatsConvidados(lista, total) {
  const confirmados = lista.filter(c => c.confirmado).length
  const pendentes   = lista.filter(c => !c.confirmado).length
  document.getElementById("stat-conv-total").textContent = total ?? lista.length
  document.getElementById("stat-conv-conf").textContent  = confirmados
  document.getElementById("stat-conv-pend").textContent  = pendentes
}

function renderTabelaConvidados(lista) {
  const tbody = document.getElementById("tabelaConvidados")

  if (!lista.length) {
    tabelaVazia("tabelaConvidados", 4)
    return
  }

  tbody.innerHTML = ""
  lista.forEach(c => {
    const badge = c.confirmado
      ? `<span class="badge badge-confirmado">Confirmado</span>`
      : `<span class="badge badge-pendente">Pendente</span>`

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${c.nome_convidado}</td>
      <td>${badge}</td>
      <td>${fmtData(c.criado_em)}</td>
      <td>
        <div class="actions">
          <button class="btn-icon" onclick="verInfoConvidado(${c.id})">🔍 Detalhes</button>
          <button class="btn-icon" onclick="alternarConfirmacao(${c.id}, ${!c.confirmado})">
            ${c.confirmado ? "↩️ Desfazer" : "✅ Confirmar"}
          </button>
        </div>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ══════════════════════════════════════════
//  MODAL INFO CONVIDADO
// ══════════════════════════════════════════
async function verInfoConvidado(id) {
  const div = document.getElementById("infoConvidado")
  div.innerHTML = `<p style="text-align:center;color:#aaa"><span class="spinner"></span>Carregando…</p>`
  abrirModal("modalConvidado")

  try {
    const res = await fetch(`${API_CONFIRMACOES}/${id}`)
    const c   = await res.json()

    const badge = c.confirmado
      ? `<span class="badge badge-confirmado">Confirmado</span>`
      : `<span class="badge badge-pendente">Pendente</span>`

    div.innerHTML = `
      <div class="info-grid">
        <div class="info-item">
          <label>Nome do Convidado</label>
          <div class="val">${c.nome_convidado}</div>
        </div>
        <div class="info-item">
          <label>Status</label>
          <div class="val">${badge}</div>
        </div>
        <div class="info-item">
          <label>Data da Resposta</label>
          <div class="val">${fmtData(c.criado_em)}</div>
        </div>
        <div class="info-item">
          <label>ID</label>
          <div class="val">#${c.id}</div>
        </div>
      </div>
    `
  } catch {
    div.innerHTML = `<div class="empty-info">Erro ao carregar informações.</div>`
  }
}

// ══════════════════════════════════════════
//  ALTERNAR CONFIRMAÇÃO
// ══════════════════════════════════════════
async function alternarConfirmacao(id, novoStatus) {
  try {
    const res = await fetch(`${API_CONFIRMACOES}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmado: novoStatus }),
    })
    if (!res.ok) throw new Error()
    toast(novoStatus ? "✅ Presença confirmada!" : "↩️ Confirmação desfeita.")
    carregarConvidados()
  } catch {
    toast("❌ Erro ao atualizar confirmação.")
  }
}

// ══════════════════════════════════════════
//  FILTROS — CONVIDADOS
// ══════════════════════════════════════════
let debounceConvidado
document.getElementById("busca-convidado").addEventListener("input", e => {
  clearTimeout(debounceConvidado)
  debounceConvidado = setTimeout(() => {
    state.convidados.busca = e.target.value
    state.convidados.page  = 1
    carregarConvidados()
  }, 400)
})

document.getElementById("filtro-confirmado").addEventListener("change", e => {
  state.convidados.confirmado = e.target.value
  state.convidados.page = 1
  carregarConvidados()
})

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
carregarPresentes()