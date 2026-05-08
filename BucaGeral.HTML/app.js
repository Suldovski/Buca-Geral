const STORAGE_KEY = "bucagrans_data";
const API_URL = "http://localhost:5000/api";

const SEED = {
  obras: [
    { id: "1", nome: "Residencial Vista Mar", localizacao: "Santos, SP", inicio: "11/03/2024", status: "Ativa" },
    { id: "2", nome: "Edifício Central Tower", localizacao: "São Paulo, SP", inicio: "31/08/2023", status: "Ativa" }
  ],
  funcionarios: [
    { id: "1", nome: "Carlos Almeida", cargo: "Engenheiro Civil", obraId: "1", admissao: "14/01/2026", status: "Ativo" },
    { id: "2", nome: "Mariana Silva", cargo: "Mestre de Obras", obraId: "1", admissao: "21/01/2026", status: "Ativo" }
  ],
  usuarios: [
    { id: "1", nome: "Admin Master", email: "admin@bucagrans.com.br", perfil: "Administrador", status: "Ativo" }
  ]
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return JSON.parse(JSON.stringify(SEED));
}

function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
const data = loadData();
const uid = () => Math.random().toString(36).slice(2, 10);
const hojeBR = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const badge = (s) => `<span class="badge ${["Ativo", "Ativa"].includes(s) ? "on" : ""}">${escapeHtml(s)}</span>`;

const pick = (obj, ...keys) => keys.find(k => obj?.[k] !== undefined && obj?.[k] !== null) ? obj[keys.find(k => obj?.[k] !== undefined && obj?.[k] !== null)] : "";
const toDateDisplay = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("pt-BR");
  return String(value);
};

function renderSidebar(active) {
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  return `<aside class="sidebar"><div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div><nav class="sidebar-nav">${items.map(i => `<a href="${i.url}" class="${active === i.id ? "active" : ""}">${i.icon}<span>${i.label}</span></a>`).join("")}</nav><div class="sidebar-foot"><div class="who">admin</div><div class="email">admin@gmail.com.br</div><a href="login.html" class="btn-logout">Sair</a></div></aside>`;
}

function mountLayout(active) {
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
}

function renderInicio() {
  document.getElementById("stat-obras").textContent = data.obras.length;
  document.getElementById("stat-func").textContent = data.funcionarios.length;
}

function renderUsuarios() {
  const tbody = document.getElementById("tbody");
  if (!tbody) return;
  tbody.innerHTML = data.usuarios.map(u => `<tr><td class="cell-strong">${escapeHtml(u.nome)}</td><td class="cell-muted">${escapeHtml(u.email)}</td><td>${escapeHtml(u.perfil)}</td><td>${badge(u.status)}</td></tr>`).join("");
}

function fillObrasSelect(sel, includeAll = false) {
  if (!sel) return;
  sel.innerHTML = (includeAll ? `<option value="all">Todas as obras</option>` : "") + data.obras.map(o => `<option value="${o.id}">${escapeHtml(o.nome)}</option>`).join("");
}

async function safeFetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Falha na requisição: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

let detalheFuncionarios = [];
let detalheFiltroTipo = null;
let funcionariosTodos = [];
let funcionariosObras = [];
let funcionariosFiltroTipo = null;

// ==================== OBRAS ====================
async function carregarObras() {
  const obras = await safeFetchJson(`${API_URL}/obras`);
  const tbody = document.getElementById("tbodyObras");
  if (!tbody) return;

  const counts = await Promise.all(obras.map(async (o) => {
    const id = pick(o, "id", "Id");
    const funcs = await safeFetchJson(`${API_URL}/funcionarios?obraId=${encodeURIComponent(id)}`);
    return { obra: o, total: Array.isArray(funcs) ? funcs.length : 0 };
  }));

  tbody.innerHTML = counts.map(({ obra, total }) => {
    const id = pick(obra, "id", "Id");
    const nome = pick(obra, "nome", "Nome");
    const localizacao = pick(obra, "localizacao", "Localizacao");
    return `<tr><td class="cell-strong"><a href="obra.html?id=${encodeURIComponent(id)}">${escapeHtml(nome)}</a></td><td>${escapeHtml(localizacao)}</td><td>${total}</td><td><button class="btn btn-sm" onclick="location.href='obra.html?id=${encodeURIComponent(id)}'">Ver</button></td></tr>`;
  }).join("");
}

// ==================== DETALHE OBRA ====================
async function carregarDetalheObra() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  const obra = await safeFetchJson(`${API_URL}/obras/${encodeURIComponent(id)}`);
  const titulo = document.getElementById("obraNome");
  if (titulo) titulo.innerText = pick(obra, "nome", "Nome") || "Obra";

  detalheFuncionarios = await safeFetchJson(`${API_URL}/funcionarios?obraId=${encodeURIComponent(id)}`) || [];
  detalheFiltroTipo = null;
  renderCards(detalheFuncionarios);
  renderTabela(detalheFuncionarios);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => filtrarTabela(detalheFuncionarios));

  const importarBtn = document.getElementById("importarBtn");
  if (importarBtn) importarBtn.onclick = () => importarPlanilha(id);

  const exportarBtn = document.getElementById("exportarBtn");
  if (exportarBtn) exportarBtn.onclick = () => window.open(`${API_URL}/funcionarios/exportar?obraId=${encodeURIComponent(id)}`, "_blank");

  const apagarTodosBtn = document.getElementById("apagarTodosBtn");
  if (apagarTodosBtn) apagarTodosBtn.onclick = () => apagarTodos(id);
}

function renderCards(funcionarios) {
  const tipos = {
    "Total Geral": funcionarios.length,
    "Efetivo": 0,
    "PJ": 0,
    "Operacional": 0,
    "ADM": 0,
    "Mobilização": 0,
    "Alteração de Função": 0,
    "Terceiros": 0
  };

  funcionarios.forEach((f) => {
    const tipo = pick(f, "tipoVinculo", "TipoVinculo");
    if (tipos[tipo] !== undefined) tipos[tipo]++;
  });

  const panel = document.getElementById("statsPanel");
  if (!panel) return;
  panel.innerHTML = "";

  Object.entries(tipos).forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<div class="label">${escapeHtml(label)}</div><div class="value">${value}</div>`;
    card.onclick = () => filtrarPorTipo(funcionarios, label === "Total Geral" ? null : label);
    panel.appendChild(card);
  });
}

function filtrarPorTipo(funcionarios, tipo) {
  if (document.getElementById("obraNome")) {
    detalheFiltroTipo = tipo;
  } else {
    funcionariosFiltroTipo = tipo;
  }

  const filtrados = tipo
    ? funcionarios.filter((f) => pick(f, "tipoVinculo", "TipoVinculo") === tipo)
    : funcionarios;
  renderTabela(filtrados);
}

function filtrarTabela(funcionarios) {
  const busca = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const obraFilter = document.getElementById("obraFilter")?.value || "";
  const tipoAtivo = document.getElementById("obraNome") ? detalheFiltroTipo : funcionariosFiltroTipo;

  const filtrados = funcionarios.filter((f) => {
    const nome = String(pick(f, "nome", "Nome")).toLowerCase();
    const cargo = String(pick(f, "cargo", "Cargo")).toLowerCase();
    const obraId = String(pick(f, "obraId", "ObraId"));
    const tipo = String(pick(f, "tipoVinculo", "TipoVinculo"));

    const matchBusca = nome.includes(busca) || cargo.includes(busca);
    const matchObra = !obraFilter || obraId === obraFilter;
    const matchTipo = !tipoAtivo || tipo === tipoAtivo;

    return matchBusca && matchObra && matchTipo;
  });

  renderTabela(filtrados);
}

function renderTabela(funcionarios) {
  const tbody = document.getElementById("tbody");
  if (!tbody) return;

  const isDetalheObra = !!document.getElementById("obraNome");

  if (isDetalheObra) {
    tbody.innerHTML = funcionarios.map((f) => {
      const id = pick(f, "id", "Id");
      return `<tr><td>${escapeHtml(pick(f, "re", "RE") || "-")}</td><td class="cell-strong">${escapeHtml(pick(f, "nome", "Nome"))}</td><td>${escapeHtml(pick(f, "cargo", "Cargo") || "-")}</td><td>${escapeHtml(pick(f, "setor", "Setor") || "-")}</td><td>${escapeHtml(pick(f, "tipoVinculo", "TipoVinculo") || "-")}</td><td>${toDateDisplay(pick(f, "dataAdmissao", "DataAdmissao"))}</td><td><button class="btn btn-sm btn-warning" onclick="abrirModalEditar('${escapeHtml(id)}')">Editar</button> <button class="btn btn-sm btn-danger" onclick="excluirFuncionario('${escapeHtml(id)}')">Excluir</button></td></tr>`;
    }).join("");
    return;
  }

  tbody.innerHTML = funcionarios.map((f) => {
    const id = pick(f, "id", "Id");
    const obraId = String(pick(f, "obraId", "ObraId"));
    const obra = funcionariosObras.find((o) => String(pick(o, "id", "Id")) === obraId);
    return `<tr><td>${escapeHtml(pick(f, "re", "RE") || "-")}</td><td class="cell-strong">${escapeHtml(pick(f, "nome", "Nome"))}</td><td>${escapeHtml(pick(f, "cargo", "Cargo") || "-")}</td><td>${escapeHtml(pick(obra || {}, "nome", "Nome") || "-")}</td><td>${escapeHtml(pick(f, "tipoVinculo", "TipoVinculo") || "-")}</td><td><button class="btn btn-sm btn-warning" onclick="abrirModalEditar('${escapeHtml(id)}')">Editar</button> <button class="btn btn-sm btn-danger" onclick="excluirFuncionario('${escapeHtml(id)}')">Excluir</button></td></tr>`;
  }).join("");
}

async function carregarFuncionarios() {
  funcionariosObras = await safeFetchJson(`${API_URL}/obras`) || [];
  funcionariosTodos = await safeFetchJson(`${API_URL}/funcionarios`) || [];
  funcionariosFiltroTipo = null;

  const obraFilter = document.getElementById("obraFilter");
  if (obraFilter) {
    obraFilter.innerHTML = '<option value="">Todas as obras</option>' + funcionariosObras.map((o) => `<option value="${escapeHtml(pick(o, "id", "Id"))}">${escapeHtml(pick(o, "nome", "Nome"))}</option>`).join("");
    obraFilter.onchange = () => filtrarTabela(funcionariosTodos);
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => filtrarTabela(funcionariosTodos));

  const importarBtn = document.getElementById("importarBtn");
  if (importarBtn) importarBtn.onclick = () => importarPlanilha();

  const exportarBtn = document.getElementById("exportarBtn");
  if (exportarBtn) exportarBtn.onclick = () => window.open(`${API_URL}/funcionarios/exportar`, "_blank");

  const apagarTodosBtn = document.getElementById("apagarTodosBtn");
  if (apagarTodosBtn) apagarTodosBtn.onclick = () => apagarTodos();

  renderCards(funcionariosTodos);
  renderTabela(funcionariosTodos);
}

async function importarPlanilha(obraId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx";
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("arquivo", file);

    const query = obraId ? `?obraId=${encodeURIComponent(obraId)}` : "";
    await fetch(`${API_URL}/funcionarios/importar${query}`, {
      method: "POST",
      body: formData
    });

    location.reload();
  };
  input.click();
}

async function apagarTodos(obraId) {
  const mensagem = obraId
    ? "Apagar TODOS os funcionários desta obra?"
    : "Apagar TODOS os funcionários?";

  if (!confirm(mensagem)) return;

  const query = obraId ? `?obraId=${encodeURIComponent(obraId)}` : "";
  await fetch(`${API_URL}/funcionarios/apagar-todos${query}`, { method: "DELETE" });
  location.reload();
}

async function excluirFuncionario(id) {
  if (!confirm("Excluir funcionário?")) return;

  await fetch(`${API_URL}/funcionarios/${encodeURIComponent(id)}`, { method: "DELETE" });
  location.reload();
}

async function abrirModalEditar(id) {
  const modal = document.getElementById("modalEditFunc");
  const form = document.getElementById("formEditFunc");
  if (!modal || !form) {
    alert("Funcionalidade de edição será implementada");
    return;
  }

  const funcionario = await safeFetchJson(`${API_URL}/funcionarios/${encodeURIComponent(id)}`);
  document.getElementById("editId").value = pick(funcionario, "id", "Id");
  document.getElementById("editRE").value = pick(funcionario, "re", "RE");
  document.getElementById("editNome").value = pick(funcionario, "nome", "Nome");
  document.getElementById("editCargo").value = pick(funcionario, "cargo", "Cargo");
  document.getElementById("editSetor").value = pick(funcionario, "setor", "Setor");
  document.getElementById("editTipoVinculo").value = pick(funcionario, "tipoVinculo", "TipoVinculo") || "Efetivo";
  document.getElementById("editSituacao").value = pick(funcionario, "situacao", "Situacao") || "Ativo";

  const dataAdmissao = pick(funcionario, "dataAdmissao", "DataAdmissao");
  const parsed = new Date(dataAdmissao);
  document.getElementById("editDataAdmissao").value = Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);

  modal.style.display = "flex";

  form.onsubmit = async (event) => {
    event.preventDefault();

    const payload = {
      id,
      re: document.getElementById("editRE").value || "",
      nome: document.getElementById("editNome").value || "",
      cargo: document.getElementById("editCargo").value || "",
      setor: document.getElementById("editSetor").value || "",
      tipoVinculo: document.getElementById("editTipoVinculo").value || "",
      situacao: document.getElementById("editSituacao").value || "",
      dataAdmissao: document.getElementById("editDataAdmissao").value || null,
      obraId: pick(funcionario, "obraId", "ObraId") || "",
      ativo: pick(funcionario, "ativo", "Ativo") ?? true,
      criadoEm: pick(funcionario, "criadoEm", "CriadoEm") || new Date().toISOString(),
      criadoPor: pick(funcionario, "criadoPor", "CriadoPor") || ""
    };

    await fetch(`${API_URL}/funcionarios/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    fecharModalEdit();
    location.reload();
  };
}

function fecharModalEdit() {
  const modal = document.getElementById("modalEditFunc");
  if (modal) modal.style.display = "none";
}

function submitNovaObra(e) {
  e.preventDefault();
  const f = e.target;
  data.obras.push({
    id: uid(),
    nome: f.nome.value.trim(),
    localizacao: f.localizacao.value.trim(),
    inicio: f.inicio.value.trim() || hojeBR(),
    status: f.status.value
  });
  saveData(data);
}

function submitNovoFuncionario(e) {
  e.preventDefault();
  const f = e.target;
  data.funcionarios.push({
    id: uid(),
    nome: f.nome.value.trim(),
    cargo: f.cargo.value.trim(),
    obraId: f.obraId.value,
    admissao: f.admissao.value.trim() || hojeBR(),
    status: f.status.value
  });
  saveData(data);
}

window.submitNovaObra = submitNovaObra;
window.submitNovoFuncionario = submitNovoFuncionario;
window.fecharModalEdit = fecharModalEdit;
window.abrirModalEditar = abrirModalEditar;
window.excluirFuncionario = excluirFuncionario;

window.BG = {
  mountLayout,
  renderInicio,
  renderUsuarios,
  fillObrasSelect,
  hojeBR,
  carregarObras,
  carregarDetalheObra,
  renderCards,
  renderTabela,
  filtrarPorTipo,
  filtrarTabela,
  importarPlanilha,
  apagarTodos,
  excluirFuncionario,
  abrirModalEditar,
  carregarFuncionarios
};
