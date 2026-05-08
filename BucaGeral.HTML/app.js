import {
  deleteFuncionario,
  getFuncionarios,
  getObras,
  getUsuarios,
  login,
  logout,
  onAuth,
  addObra
} from "./firebase-config.js";

let usuarioLogado = null;
let detalheFuncionarios = [];
let funcionariosTodos = [];
let funcionariosObras = [];
let detalheFiltroTipo = null;
let funcionariosFiltroTipo = null;

const PAGE_LOGIN = "login.html";
const PAGE_INDEX = "index.html";

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function getCurrentPage() {
  const path = window.location.pathname.split("/").pop();
  return path || PAGE_INDEX;
}

function isPublicPage(page) {
  return page === PAGE_LOGIN || page === PAGE_INDEX;
}

function authRedirect(user) {
  const page = getCurrentPage();
  if (user && isPublicPage(page)) {
    window.location.href = "inicio.html";
    return;
  }

  if (!user && !isPublicPage(page)) {
    window.location.href = "login.html";
  }
}

onAuth((user) => {
  if (user) {
    usuarioLogado = { uid: user.uid, email: user.email || "", nome: user.displayName || user.email || "" };
    localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
  } else {
    usuarioLogado = null;
    localStorage.removeItem("usuario");
  }
  authRedirect(user);
});

export async function fazerLogin(email, senha) {
  await login(email, senha);
}

export async function fazerLogout() {
  await logout();
}

function renderSidebar(active) {
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  return `<aside class="sidebar"><div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div><nav class="sidebar-nav">${items.map((item) => `<a href="${item.url}" class="${active === item.id ? "active" : ""}">${item.icon}<span>${item.label}</span></a>`).join("")}</nav><div class="sidebar-foot"><div class="who">${escapeHtml(usuario.nome || "admin")}</div><div class="email">${escapeHtml(usuario.email || "")}</div><a href="#" onclick="fazerLogout(); return false;" class="btn-logout"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Sair</a></div></aside>`;
}

export function mountLayout(active) {
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
}

export async function renderInicio() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();

  const statObras = document.getElementById("stat-obras");
  const statFunc = document.getElementById("stat-func");
  if (statObras) statObras.textContent = String(obras.length);
  if (statFunc) statFunc.textContent = String(funcionarios.length);

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const counts = meses.map((_, i) => funcionarios.filter((f) => {
    if (!f.dataAdmissao) return false;
    const d = new Date(f.dataAdmissao);
    return d.getFullYear() === 2026 && d.getMonth() === i;
  }).length);
  const max = Math.max(1, ...counts);
  const bars = document.getElementById("bars");
  if (bars) {
    bars.innerHTML = meses.map((m, i) => `<div class="col"><div class="bar" style="height:${(counts[i] / max) * 100}%"></div><div class="lbl">${m}</div></div>`).join("");
  }

  const cargosCount = funcionarios.reduce((acc, f) => {
    const cargo = f.cargo || "Sem cargo";
    acc[cargo] = (acc[cargo] || 0) + 1;
    return acc;
  }, {});
  const cargos = Object.entries(cargosCount).sort((a, b) => b[1] - a[1]);
  const maxC = Math.max(1, ...cargos.map(([, c]) => c));
  const rank = document.getElementById("rank");
  if (rank) {
    rank.innerHTML = cargos.map(([cargo, c]) => `<div class="rank-row"><div class="rank-head"><span>${escapeHtml(cargo)}</span><span class="n">${c}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(c / maxC) * 100}%"></div></div></div>`).join("");
  }
}

export async function carregarObras() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  const tbody = document.getElementById("tbodyObras");
  if (!tbody) return;

  tbody.innerHTML = obras.map((obra) => {
    const qtdFunc = funcionarios.filter((f) => f.obraId === obra.id).length;
    return `<tr><td class="cell-strong"><a href="obra.html?id=${encodeURIComponent(obra.id)}">${escapeHtml(obra.nome)}</a></td><td>${escapeHtml(obra.localizacao || "")}</td><td>${qtdFunc}</td><td><button class="btn btn-sm" onclick="location.href='obra.html?id=${encodeURIComponent(obra.id)}'">Ver</button></td></tr>`;
  }).join("");
}

export async function adicionarObra(nome, localizacao) {
  await addObra({ nome, localizacao, dataInicio: new Date().toISOString(), ativo: true });
  await carregarObras();
}

export async function carregarDetalheObra() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const obras = await getObras();
  const obra = obras.find((item) => item.id === id);
  if (!obra) return;

  const obraNome = document.getElementById("obraNome");
  if (obraNome) obraNome.innerText = obra.nome;

  detalheFuncionarios = await getFuncionarios(id);
  detalheFiltroTipo = null;
  renderCards(detalheFuncionarios);
  renderTabela(detalheFuncionarios);

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => filtrarTabela(detalheFuncionarios));

  const importarBtn = document.getElementById("importarBtn");
  if (importarBtn) importarBtn.addEventListener("click", () => alert("Importação será implementada em breve"));

  const exportarBtn = document.getElementById("exportarBtn");
  if (exportarBtn) exportarBtn.addEventListener("click", () => alert("Exportação será implementada em breve"));

  const apagarTodosBtn = document.getElementById("apagarTodosBtn");
  if (apagarTodosBtn) apagarTodosBtn.addEventListener("click", () => alert("Apagar todos será implementado"));
}

function renderCards(funcionarios) {
  const tipos = {
    "Total Geral": funcionarios.length,
    Efetivo: 0,
    PJ: 0,
    Operacional: 0,
    ADM: 0,
    "Mobilização": 0,
    "Alteração de Função": 0,
    Terceiros: 0
  };

  funcionarios.forEach((f) => {
    if (tipos[f.tipoVinculo] !== undefined) tipos[f.tipoVinculo] += 1;
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

  const filtrados = tipo ? funcionarios.filter((f) => f.tipoVinculo === tipo) : funcionarios;
  renderTabela(filtrados);
}

function filtrarTabela(funcionarios) {
  const busca = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const obraFilter = document.getElementById("obraFilter")?.value || "";
  const tipoAtivo = document.getElementById("obraNome") ? detalheFiltroTipo : funcionariosFiltroTipo;

  const filtrados = funcionarios.filter((f) => {
    const nome = (f.nome || "").toLowerCase();
    const cargo = (f.cargo || "").toLowerCase();
    const matchBusca = nome.includes(busca) || cargo.includes(busca);
    const matchObra = !obraFilter || f.obraId === obraFilter;
    const matchTipo = !tipoAtivo || f.tipoVinculo === tipoAtivo;
    return matchBusca && matchObra && matchTipo;
  });

  renderTabela(filtrados);
}

function renderTabela(funcionarios) {
  const tbody = document.getElementById("tbody");
  if (!tbody) return;

  const isDetalheObra = Boolean(document.getElementById("obraNome"));

  if (isDetalheObra) {
    tbody.innerHTML = funcionarios.map((f) => {
      const admissao = f.dataAdmissao ? new Date(f.dataAdmissao).toLocaleDateString("pt-BR") : "-";
      const id = escapeHtml(f.id);
      return `
        <tr>
          <td>${escapeHtml(f.re || "-")}</td>
          <td class="cell-strong">${escapeHtml(f.nome || "")}</td>
          <td>${escapeHtml(f.cargo || "")}</td>
          <td>${escapeHtml(f.setor || "-")}</td>
          <td>${escapeHtml(f.tipoVinculo || "-")}</td>
          <td>${admissao}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarFuncionario('${id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirFuncionario('${id}')">Excluir</button>
          </td>
        </tr>`;
    }).join("");
    return;
  }

  tbody.innerHTML = funcionarios.map((f) => {
    const obraNome = funcionariosObras.find((o) => o.id === f.obraId)?.nome || "N/A";
    const id = escapeHtml(f.id);
    return `
      <tr>
        <td>${escapeHtml(f.re || "-")}</td>
        <td class="cell-strong">${escapeHtml(f.nome || "")}</td>
        <td>${escapeHtml(f.cargo || "")}</td>
        <td>${escapeHtml(obraNome)}</td>
        <td>${escapeHtml(f.tipoVinculo || "-")}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarFuncionario('${id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="excluirFuncionario('${id}')">Excluir</button>
        </td>
      </tr>`;
  }).join("");
}

export async function carregarFuncionarios() {
  funcionariosObras = await getObras();
  funcionariosTodos = await getFuncionarios();
  funcionariosFiltroTipo = null;

  const obraFilter = document.getElementById("obraFilter");
  if (obraFilter) {
    obraFilter.innerHTML = '<option value="">Todas as obras</option>' + funcionariosObras.map((o) => `<option value="${o.id}">${escapeHtml(o.nome)}</option>`).join("");
    obraFilter.onchange = () => filtrarTabela(funcionariosTodos);
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => filtrarTabela(funcionariosTodos));

  const importarBtn = document.getElementById("importarBtn");
  if (importarBtn) importarBtn.onclick = () => alert("Importação será implementada em breve");

  const exportarBtn = document.getElementById("exportarBtn");
  if (exportarBtn) exportarBtn.onclick = () => alert("Exportação será implementada em breve");

  const apagarTodosBtn = document.getElementById("apagarTodosBtn");
  if (apagarTodosBtn) apagarTodosBtn.onclick = () => alert("Apagar todos será implementado");

  renderCards(funcionariosTodos);
  renderTabela(funcionariosTodos);
}

export async function carregarUsuarios() {
  const usuarios = await getUsuarios();
  const tbody = document.getElementById("tbody");
  if (!tbody) return;

  tbody.innerHTML = usuarios.map((u) => `
    <tr>
      <td>${escapeHtml(u.nome || "")}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td>${escapeHtml(u.perfil || "Operador")}</td>
      <td>${escapeHtml(u.obraId || "-")}</td>
      <td>
        <button class="btn btn-sm btn-warning">Editar</button>
        <button class="btn btn-sm btn-danger">Excluir</button>
      </td>
    </tr>`).join("");
}

function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const erroMsg = document.getElementById("erroMsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value?.trim() || "";
    const senha = document.getElementById("senha")?.value || "";

    if (!email || !senha) {
      if (erroMsg) erroMsg.textContent = "Preencha e-mail e senha.";
      return;
    }

    try {
      if (erroMsg) erroMsg.textContent = "";
      await fazerLogin(email, senha);
    } catch (error) {
      if (erroMsg) erroMsg.textContent = "E-mail ou senha inválidos.";
      console.error(error?.code || "login-error");
    }
  });
}

window.editarFuncionario = () => alert("Edição será implementada em breve");
window.excluirFuncionario = async (id) => {
  if (!window.confirm("Excluir funcionário?")) return;
  await deleteFuncionario(id);
  window.location.reload();
};
window.fazerLogout = fazerLogout;

window.BG = {
  mountLayout,
  renderInicio,
  carregarObras,
  adicionarObra,
  carregarDetalheObra,
  carregarFuncionarios,
  carregarUsuarios,
  fazerLogout,
  fazerLogin
};

initLoginPage();
