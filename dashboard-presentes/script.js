const API_BASE = "http://localhost:5000/api"
const API_PRESENTES = `${API_BASE}/presentes`
const API_CONFIRMACOES = `${API_BASE}/confirmacoes`

// ══════════════════════════════════════════
//  SUPABASE STORAGE
// ══════════════════════════════════════════
const SUPABASE_URL    = "https://ykarsdzejkpmvzhnyuwe.supabase.co"
const SUPABASE_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrYXJzZHplamtwbXZ6aG55dXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjMxMDgsImV4cCI6MjA4ODAzOTEwOH0.IKeWI53jG4aGuOFztlrKLuYjQ6N7llyELTGpevbiXtg"
const SUPABASE_BUCKET = "presentes-imagens"

async function uploadImagemSupabase(file) {
  const ext = file.name.split(".").pop().toLowerCase()

  const mimeMap = {
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
    gif:  "image/gif",
  }
  const contentType = mimeMap[ext] || file.type || "application/octet-stream"

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  console.log("Iniciando upload:", fileName, contentType)

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${fileName}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "apikey": SUPABASE_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: file,
    }
  )

  console.log("Status:", res.status)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error("SUPABASE RESPONSE:", JSON.stringify(err))
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`
}

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
  if (id === "modalNovoPresente") resetUpload("novo")
  if (id === "modalEditar")       resetUpload("edit")
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

function unwrap(json) {
  return json?.data ?? json
}

function resetForm(formId) {
  document.getElementById(formId).reset()
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
  document.getElementById(tbodyId).innerHTML =
    `<tr class="state-row"><td colspan="${cols}"><span class="spinner"></span>Carregando…</td></tr>`
}

function tabelaVazia(tbodyId, cols, msg = "Nenhum item encontrado.") {
  document.getElementById(tbodyId).innerHTML =
    `<tr class="state-row"><td colspan="${cols}">${msg}</td></tr>`
}

// ══════════════════════════════════════════
//  UPLOAD DE IMAGEM
//  prefix: "novo" ou "edit"
// ══════════════════════════════════════════
async function handleImageUpload(prefix) {
  const input = document.getElementById(`${prefix}_file`)
  const file  = input.files[0]
  if (!file) return

  setUploadState(prefix, "loading")

  try {
    const url = await uploadImagemSupabase(file)
    document.getElementById(`${prefix}_imagem`).value = url
    setUploadState(prefix, "done", url)
    toast("🖼️ Imagem enviada com sucesso!")
  } catch (err) {
    setUploadState(prefix, "idle")
    toast(`❌ Erro ao enviar imagem: ${err.message}`)
  }
}

// Quando cola URL manualmente
function syncUrlPreview(prefix) {
  const url = document.getElementById(`${prefix}_imagem`).value.trim()
  if (url) {
    setUploadState(prefix, "done", url)
  } else {
    setUploadState(prefix, "idle")
  }
}

function setUploadState(prefix, estadoAtual, url = null) {
  const area        = document.getElementById(`${prefix}_upload_area`)
  const preview     = document.getElementById(`${prefix}_preview`)
  const placeholder = document.getElementById(`${prefix}_upload_placeholder`)
  const loading     = document.getElementById(`${prefix}_upload_loading`)
  if (!area) return

  if (estadoAtual === "loading") {
    placeholder.style.display = "none"
    preview.style.display     = "none"
    loading.style.display     = "flex"
    area.classList.remove("has-image")
  } else if (estadoAtual === "done" && url) {
    loading.style.display     = "none"
    placeholder.style.display = "none"
    preview.src               = url
    preview.style.display     = "block"
    area.classList.add("has-image")
  } else {
    loading.style.display     = "none"
    preview.style.display     = "none"
    placeholder.style.display = "flex"
    area.classList.remove("has-image")
    if (preview) preview.src  = ""
  }
}

function resetUpload(prefix) {
  const input = document.getElementById(`${prefix}_file`)
  if (input) input.value = ""
  const urlInput = document.getElementById(`${prefix}_imagem`)
  if (urlInput) urlInput.value = ""
  setUploadState(prefix, "idle")
}

// Drag & drop
document.addEventListener("DOMContentLoaded", () => {
  ;["novo", "edit"].forEach(prefix => {
    const area = document.getElementById(`${prefix}_upload_area`)
    if (!area) return

    area.addEventListener("dragover", e => {
      e.preventDefault()
      area.classList.add("drag-over")
    })
    area.addEventListener("dragleave", () => area.classList.remove("drag-over"))
    area.addEventListener("drop", e => {
      e.preventDefault()
      area.classList.remove("drag-over")
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith("image/")) return
      const input = document.getElementById(`${prefix}_file`)
      const dt    = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      handleImageUpload(prefix)
    })
  })
})

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

  let json
  try {
    const res = await fetch(`${API_PRESENTES}?${params}`)
    if (!res.ok) throw new Error(res.status)
    json = await res.json()
  } catch {
    tabelaVazia("tabelaPresentes", 6, "Erro ao conectar com a API.")
    return
  }

  const lista = json.data || []
  const total = json.count ?? lista.length

  atualizarStatsPresentes(lista, total)
  popularCategorias(lista)
  renderTabelaPresentes(lista)
  renderPaginacao("paginacaoPresentes", page, total, limit, p => {
    state.presentes.page = p
    carregarPresentes()
  })
}

function atualizarStatsPresentes(lista, total) {
  const disponiveis = lista.filter(p => p.disponivel).length
  const reservados  = lista.filter(p => !p.disponivel).length
  document.getElementById("stat-total").textContent = total ?? lista.length
  document.getElementById("stat-disp").textContent  = disponiveis
  document.getElementById("stat-res").textContent   = reservados
}

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

function renderTabelaPresentes(lista) {
  const tbody = document.getElementById("tabelaPresentes")
  if (!lista.length) { tabelaVazia("tabelaPresentes", 6); return }

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
          ${!p.disponivel
            ? `<button class="btn-icon warning" onclick="cancelarReserva(${p.id})">🔓 Liberar</button>`
            : ""}
          <button class="btn-icon danger" onclick="excluirPresente(${p.id})">🗑️ Excluir</button>
        </div>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ══════════════════════════════════════════
//  NOVO PRESENTE
// ══════════════════════════════════════════
document.getElementById("formNovoPresente").addEventListener("submit", async function (e) {
  e.preventDefault()
  const btn = this.querySelector("button[type=submit]")
  btn.disabled = true
  btn.textContent = "Salvando…"

  const body = {
    nome_presente:    document.getElementById("novo_nome").value.trim(),
    descricao:        document.getElementById("novo_descricao").value.trim(),
    valor:            parseFloat(document.getElementById("novo_valor").value),
    categoria:        document.getElementById("novo_categoria").value.trim() || "outros",
    tipo_pagamento:   document.getElementById("novo_pagamento").value || null,
    url_image:        document.getElementById("novo_imagem").value.trim() || null,
    quantidade_total: parseInt(document.getElementById("novo_quantidade").value) || 1,
    ativo:            true,
  }

  try {
    const res = await fetch(API_PRESENTES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.status)
    }
    fecharModal("modalNovoPresente")
    resetForm("formNovoPresente")
    resetUpload("novo")
    toast("🎁 Presente adicionado com sucesso!")
    state.presentes.page = 1
    carregarPresentes()
  } catch (err) {
    toast(`❌ Erro: ${err.message}`)
  } finally {
    btn.disabled = false
    btn.textContent = "Adicionar Presente"
  }
})

// ══════════════════════════════════════════
//  MODAL INFO RESERVA
// ══════════════════════════════════════════
async function verInfoReserva(id) {
  const div = document.getElementById("infoReserva")
  div.innerHTML = `<p style="text-align:center;color:#aaa"><span class="spinner"></span>Carregando…</p>`
  abrirModal("modalInfo")

  try {
    const res = await fetch(`${API_PRESENTES}/${id}`)
    if (!res.ok) throw new Error(res.status)
    const p = unwrap(await res.json())

    if (!p.reservado_por) {
      div.innerHTML = `<div class="empty-info">Este presente ainda não foi reservado.</div>`
      return
    }

    const r = p.reservado_por
    div.innerHTML = `
      <div class="info-grid">
        <div class="info-item"><label>Nome</label><div class="val">${r.nome_convidado || "—"}</div></div>
        <div class="info-item"><label>E-mail</label><div class="val">${r.email_convidado || "—"}</div></div>
        <div class="info-item"><label>Telefone</label><div class="val">${r.telefone_convidado || "—"}</div></div>
        <div class="info-item"><label>Data da Reserva</label><div class="val">${fmtData(r.criado_em)}</div></div>
        ${r.mensagem ? `<div class="info-item info-msg" style="grid-column:1/-1">"${r.mensagem}"</div>` : ""}
      </div>
    `
  } catch {
    div.innerHTML = `<div class="empty-info">Erro ao carregar informações.</div>`
  }
}

// ══════════════════════════════════════════
//  MODAL EDITAR PRESENTE
// ══════════════════════════════════════════
async function abrirEditar(id) {
  try {
    const res = await fetch(`${API_PRESENTES}/${id}`)
    if (!res.ok) throw new Error(res.status)
    const p = unwrap(await res.json())

    document.getElementById("edit_id").value         = p.id
    document.getElementById("edit_nome").value       = p.nome_presente    || ""
    document.getElementById("edit_descricao").value  = p.descricao        || ""
    document.getElementById("edit_valor").value      = p.valor            ?? ""
    document.getElementById("edit_categoria").value  = p.categoria        || ""
    document.getElementById("edit_pagamento").value  = p.tipo_pagamento   || ""
    document.getElementById("edit_quantidade").value = p.quantidade_total ?? 1

    // Preenche imagem — se tiver URL existente já mostra o preview
    const urlAtual = p.url_image || ""
    document.getElementById("edit_imagem").value = urlAtual
    if (urlAtual) {
      setUploadState("edit", "done", urlAtual)
    } else {
      setUploadState("edit", "idle")
    }

    abrirModal("modalEditar")
  } catch {
    toast("❌ Erro ao carregar presente.")
  }
}

document.getElementById("formEditar").addEventListener("submit", async function (e) {
  e.preventDefault()
  const btn = this.querySelector("button[type=submit]")
  btn.disabled = true
  btn.textContent = "Salvando…"

  const id = document.getElementById("edit_id").value
  const body = {
    nome_presente:    document.getElementById("edit_nome").value,
    descricao:        document.getElementById("edit_descricao").value,
    valor:            parseFloat(document.getElementById("edit_valor").value),
    categoria:        document.getElementById("edit_categoria").value,
    tipo_pagamento:   document.getElementById("edit_pagamento").value || null,
    url_image:        document.getElementById("edit_imagem").value.trim() || null,
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
  } finally {
    btn.disabled = false
    btn.textContent = "Salvar Alterações"
  }
})

// ══════════════════════════════════════════
//  CANCELAR RESERVA
// ══════════════════════════════════════════
async function cancelarReserva(id) {
  if (!confirm("Deseja cancelar a reserva e liberar este presente?")) return

  try {
    const res = await fetch(`${API_PRESENTES}/${id}/cancelar-reserva`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.status)
    }
    toast("🔓 Reserva cancelada. Presente disponível novamente.")
    carregarPresentes()
  } catch (err) {
    toast(`❌ Erro: ${err.message}`)
  }
}

// ══════════════════════════════════════════
//  EXCLUIR PRESENTE
// ══════════════════════════════════════════
async function excluirPresente(id) {
  if (!confirm("Deseja realmente excluir este presente?")) return

  try {
    const res = await fetch(`${API_PRESENTES}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error()
    toast("🗑️ Presente excluído.")
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

  let json
  try {
    const res = await fetch(`${API_CONFIRMACOES}?${params}`)
    if (!res.ok) throw new Error(res.status)
    json = await res.json()
  } catch {
    tabelaVazia("tabelaConvidados", 4, "Erro ao conectar com a API.")
    return
  }

  const lista = json.data || []
  const total = json.count ?? lista.length

  atualizarStatsConvidados(lista, total)
  renderTabelaConvidados(lista)
  renderPaginacao("paginacaoConvidados", page, total, limit, p => {
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
  if (!lista.length) { tabelaVazia("tabelaConvidados", 4); return }

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
          <button class="btn-icon danger" onclick="excluirConvidado(${c.id})">🗑️ Excluir</button>
        </div>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// ══════════════════════════════════════════
//  NOVO CONVIDADO
// ══════════════════════════════════════════
document.getElementById("formNovoConvidado").addEventListener("submit", async function (e) {
  e.preventDefault()
  const btn = this.querySelector("button[type=submit]")
  btn.disabled = true
  btn.textContent = "Salvando…"

  const nome       = document.getElementById("novo_conv_nome").value.trim()
  const confirmado = document.getElementById("novo_conv_confirmado").value === "true"

  if (!nome) {
    toast("❌ Informe o nome do convidado.")
    btn.disabled = false
    btn.textContent = "Adicionar Convidado"
    return
  }

  try {
    const res = await fetch(API_CONFIRMACOES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_convidado: nome, confirmado }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.status)
    }
    fecharModal("modalNovoConvidado")
    resetForm("formNovoConvidado")
    toast("👥 Convidado adicionado com sucesso!")
    state.convidados.page = 1
    carregarConvidados()
  } catch (err) {
    toast(`❌ Erro: ${err.message}`)
  } finally {
    btn.disabled = false
    btn.textContent = "Adicionar Convidado"
  }
})

// ══════════════════════════════════════════
//  MODAL INFO CONVIDADO
// ══════════════════════════════════════════
async function verInfoConvidado(id) {
  const div = document.getElementById("infoConvidado")
  div.innerHTML = `<p style="text-align:center;color:#aaa"><span class="spinner"></span>Carregando…</p>`
  abrirModal("modalConvidado")

  try {
    const res = await fetch(`${API_CONFIRMACOES}/${id}`)
    if (!res.ok) throw new Error(res.status)
    const c = unwrap(await res.json())

    const badge = c.confirmado
      ? `<span class="badge badge-confirmado">Confirmado</span>`
      : `<span class="badge badge-pendente">Pendente</span>`

    div.innerHTML = `
      <div class="info-grid">
        <div class="info-item"><label>Nome do Convidado</label><div class="val">${c.nome_convidado}</div></div>
        <div class="info-item"><label>Status</label><div class="val">${badge}</div></div>
        <div class="info-item"><label>Data da Resposta</label><div class="val">${fmtData(c.criado_em)}</div></div>
        <div class="info-item"><label>ID</label><div class="val">#${c.id}</div></div>
      </div>
    `
  } catch {
    div.innerHTML = `<div class="empty-info">Erro ao carregar informações.</div>`
  }
}

// ══════════════════════════════════════════
//  EXCLUIR CONVIDADO
// ══════════════════════════════════════════
async function excluirConvidado(id) {
  if (!confirm("Deseja realmente excluir este convidado?")) return

  try {
    const res = await fetch(`${API_CONFIRMACOES}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error()
    toast("🗑️ Convidado excluído.")
    const linhas = document.querySelectorAll("#tabelaConvidados tr:not(.state-row)").length
    if (linhas === 1 && state.convidados.page > 1) state.convidados.page--
    carregarConvidados()
  } catch {
    toast("❌ Erro ao excluir convidado.")
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