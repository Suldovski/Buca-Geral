const STORAGE_KEY = "bucagrans_data";

const SEED = {
  obras: [
    { id: "1", nome: "Residencial Vista Mar", localizacao: "Santos, SP", inicio: "11/03/2024", status: "Ativa" },
    { id: "2", nome: "Edifício Central Tower", localizacao: "São Paulo, SP", inicio: "31/08/2023", status: "Ativa" },
    { id: "3", nome: "Galpão Logístico Norte", localizacao: "Campinas, SP", inicio: "19/01/2024", status: "Ativa" },
    { id: "4", nome: "Reforma Sede Matriz", localizacao: "Rio de Janeiro, RJ", inicio: "09/05/2022", status: "Encerrada" }
  ],
  funcionarios: [
    { id: "1", nome: "Carlos Almeida", cargo: "Engenheiro Civil", obraId: "1", admissao: "14/01/2026", status: "Ativo" },
    { id: "2", nome: "Mariana Silva", cargo: "Mestre de Obras", obraId: "1", admissao: "21/01/2026", status: "Ativo" },
    { id: "3", nome: "João Pedro Santos", cargo: "Pedreiro", obraId: "1", admissao: "04/02/2026", status: "Ativo" },
    { id: "4", nome: "Ana Paula Costa", cargo: "Engenheiro Civil", obraId: "2", admissao: "17/02/2026", status: "Ativo" },
    { id: "5", nome: "Roberto Lima", cargo: "Eletricista", obraId: "2", admissao: "27/02/2026", status: "Ativo" },
    { id: "6", nome: "Fernanda Rocha", cargo: "Pedreiro", obraId: "2", admissao: "03/03/2026", status: "Inativo" },
    { id: "7", nome: "Lucas Pereira", cargo: "Pedreiro", obraId: "3", admissao: "11/03/2026", status: "Ativo" },
    { id: "8", nome: "Patrícia Mendes", cargo: "Auxiliar Administrativo", obraId: "3", admissao: "19/03/2026", status: "Ativo" },
    { id: "9", nome: "Gustavo Henrique", cargo: "Pintor", obraId: "4", admissao: "01/04/2026", status: "Inativo" },
    { id: "10", nome: "Renata Souza", cargo: "Pedreiro", obraId: "1", admissao: "09/04/2026", status: "Ativo" },
    { id: "11", nome: "Tiago Martins", cargo: "Eletricista", obraId: "3", admissao: "21/04/2026", status: "Ativo" },
    { id: "12", nome: "Beatriz Andrade", cargo: "Pedreiro", obraId: "2", admissao: "05/05/2026", status: "Ativo" }
  ],
  usuarios: [
    { id: "1", nome: "Admin Master", email: "admin@bucagrans.com.br", perfil: "Administrador", status: "Ativo" },
    { id: "2", nome: "Joana Engenheira", email: "joana@bucagrans.com.br", perfil: "Operador", status: "Ativo" },
    { id: "3", nome: "Marcos Diretor", email: "marcos@bucagrans.com.br", perfil: "Visualizador", status: "Inativo" }
  ]
};

function loadData() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch(e) {} return JSON.parse(JSON.stringify(SEED)); }
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
const data = loadData();
const uid = () => Math.random().toString(36).slice(2, 10);
const hojeBR = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge = (s) => `<span class="badge ${["Ativo","Ativa"].includes(s) ? "on" : ""}">${s}</span>`;
const obraNome = (id) => (data.obras.find(o => o.id === id) || {}).nome || "—";

function renderSidebar(active) {
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  return `<aside class="sidebar"><div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div><nav class="sidebar-nav">${items.map(i => `<a href="${i.url}" class="${active===i.id?"active":""}">${i.icon}<span>${i.label}</span></a>`).join("")}</nav><div class="sidebar-foot"><div class="who">admin</div><div class="email">admin@gmail.com.br</div><a href="login.html" class="btn-logout"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Sair</a></div></aside>`;
}

function mountLayout(active) { const slot = document.getElementById("sidebar-slot"); if (slot) slot.outerHTML = renderSidebar(active); }
function openDialog(id) { document.getElementById(id).classList.add("open"); }
function closeDialog(id) { document.getElementById(id).classList.remove("open"); }
window.openDialog = openDialog;
window.closeDialog = closeDialog;

function renderInicio() {
  document.getElementById("stat-obras").textContent = data.obras.length;
  document.getElementById("stat-func").textContent = data.funcionarios.length;
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const counts = meses.map((_, i) => data.funcionarios.filter(f => { const [, mm, yyyy] = f.admissao.split("/"); return Number(mm) === i+1 && yyyy === "2026"; }).length);
  const max = Math.max(1, ...counts);
  document.getElementById("bars").innerHTML = meses.map((m, i) => `<div class="col"><div class="bar" style="height:${(counts[i]/max)*100}%"></div><div class="lbl">${m}</div></div>`).join("");
  const cargosCount = data.funcionarios.reduce((acc, f) => { acc[f.cargo] = (acc[f.cargo]||0)+1; return acc; }, {});
  const cargos = Object.entries(cargosCount).sort((a,b) => b[1]-a[1]);
  const maxC = Math.max(1, ...cargos.map(([,c]) => c));
  document.getElementById("rank").innerHTML = cargos.map(([cargo, c]) => `<div class="rank-row"><div class="rank-head"><span>${escapeHtml(cargo)}</span><span class="n">${c}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(c/maxC)*100}%"></div></div></div>`).join("");
}

function renderObras() {
  const q = (document.getElementById("q")?.value || "").toLowerCase();
  const rows = data.obras.filter(o => o.nome.toLowerCase().includes(q) || o.localizacao.toLowerCase().includes(q));
  document.getElementById("tbody").innerHTML = rows.map(o => {
    const efetivo = data.funcionarios.filter(f => f.obraId === o.id && f.status === "Ativo").length;
    return `<tr onclick="location.href='obra.html?id=${o.id}'"><td class="cell-strong"><a href="obra.html?id=${o.id}" class="cell-link">${escapeHtml(o.nome)}</a><\/td><td class="cell-muted"><span class="with-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7.58 7-13a7 7 0 10-14 0c0 5.42 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>${escapeHtml(o.localizacao)}</span><\/td><td>${o.inicio}<\/td><td>${efetivo} ativos<\/td><td>${badge(o.status)}<\/td><\/tr>`;
  }).join("") || `<tr><td colspan="5" class="cell-muted" style="text-align:center;padding:30px">Nenhuma obra encontrada</td></tr>`;
}

function fillObrasSelect(sel, includeAll = false) {
  sel.innerHTML = (includeAll ? `<option value="all">Todas as obras</option>` : "") + data.obras.map(o => `<option value="${o.id}">${escapeHtml(o.nome)}</option>`).join("");
}

function renderFuncionarios() {
  const q = (document.getElementById("q")?.value || "").toLowerCase();
  const obraSel = document.getElementById("obra-filter")?.value || "all";
  const rows = data.funcionarios.filter(f => (obraSel === "all" || f.obraId === obraSel) && (f.nome.toLowerCase().includes(q) || f.cargo.toLowerCase().includes(q)));
  document.getElementById("tbody").innerHTML = rows.map(f => `<tr><td class="cell-strong">${escapeHtml(f.nome)}<\/td><td>${escapeHtml(f.cargo)}<\/td><td class="cell-muted">${escapeHtml(obraNome(f.obraId))}<\/td><td>${f.admissao}<\/td><td>${badge(f.status)}<\/td><\/tr>`).join("") || `<tr><td colspan="5" class="cell-muted" style="text-align:center;padding:30px">Nenhum funcionário encontrado</td></tr>`;
}

function renderUsuarios() {
  document.getElementById("tbody").innerHTML = data.usuarios.map(u => `<tr><td class="cell-strong">${escapeHtml(u.nome)}<\/td><td class="cell-muted">${escapeHtml(u.email)}<\/td><td>${escapeHtml(u.perfil)}<\/td><td>${badge(u.status)}<\/td><\/tr>`).join("");
}

function submitNovaObra(e) { e.preventDefault(); const f = e.target; data.obras.push({ id: uid(), nome: f.nome.value.trim(), localizacao: f.localizacao.value.trim(), inicio: f.inicio.value.trim() || hojeBR(), status: f.status.value }); saveData(data); closeDialog("dlg-obra"); f.reset(); f.inicio.value = hojeBR(); renderObras(); }
function submitNovoFuncionario(e) { e.preventDefault(); const f = e.target; data.funcionarios.push({ id: uid(), nome: f.nome.value.trim(), cargo: f.cargo.value.trim(), obraId: f.obraId.value, admissao: f.admissao.value.trim() || hojeBR(), status: f.status.value }); saveData(data); closeDialog("dlg-func"); f.reset(); f.admissao.value = hojeBR(); renderFuncionarios(); }
window.submitNovaObra = submitNovaObra;
window.submitNovoFuncionario = submitNovoFuncionario;

window.BG = { mountLayout, renderInicio, renderObras, renderFuncionarios, renderUsuarios, fillObrasSelect, hojeBR };
