// app.js - Versão completa OBCAS
import { 
  auth, login, logout, onAuth,
  getObras, addObra, updateObra, deleteObra,
  getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario,
  getUsuarios, addUsuario, updateUsuario, deleteUsuario, getUsuarioByEmail
} from './firebase-config.js';

let usuarioLogado = null;

// ==================== AUTENTICAÇÃO ====================
export async function fazerLogin(email, senha) {
  try {
    const user = await login(email, senha);
    const usuarioSistema = await getUsuarioByEmail(email);
    if (!usuarioSistema) { await logout(); return false; }
    usuarioLogado = { uid: user.uid, email: user.email, nome: usuarioSistema.nome, perfil: usuarioSistema.perfil, obraId: usuarioSistema.obraId };
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    return true;
  } catch (error) { return false; }
}

export async function fazerLogout() { await logout(); localStorage.clear(); window.location.href = 'login.html'; }

onAuth((user) => { if (!user) localStorage.clear(); });

// ==================== SIDEBAR ====================
function renderSidebar(active) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  return '<aside class="sidebar"><div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div><nav class="sidebar-nav">' + items.map(i => '<a href="' + i.url + '" class="' + (active === i.id ? 'active' : '') + '">' + i.icon + '<span>' + i.label + '</span></a>').join('') + '</nav><div class="sidebar-foot"><div class="who">' + (usuario.nome || 'admin') + '</div><div class="email">' + (usuario.email || '') + '</div><a href="#" id="logout-button" class="btn-logout">Sair</a></div></aside>';
}

export function mountLayout(active) { const slot = document.getElementById("sidebar-slot"); if (slot) slot.outerHTML = renderSidebar(active); const logoutBtn = document.getElementById('logout-button'); if (logoutBtn) logoutBtn.onclick = (e) => { e.preventDefault(); fazerLogout(); }; }

// ==================== INÍCIO ====================
export async function renderInicio() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  document.getElementById('stat-obras').textContent = obras.length;
  document.getElementById('stat-func').textContent = funcionarios.length;
  
  // Gráfico de contratações por mês (2026)
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const counts = meses.map((_, i) => funcionarios.filter(f => { if (!f.dataAdmissao) return false; const d = new Date(f.dataAdmissao); return d.getFullYear() === 2026 && d.getMonth() === i; }).length);
  const max = Math.max(1, ...counts);
  const barsContainer = document.getElementById('bars');
  if (barsContainer) barsContainer.innerHTML = meses.map((m, i) => '<div class="col"><div class="bar" style="height:' + ((counts[i]/max)*100) + '%"></div><div class="lbl">' + m + '</div></div>').join('');
  
  // Ranking de funções
  const cargosCount = {};
  funcionarios.forEach(f => { if (f.cargo) cargosCount[f.cargo] = (cargosCount[f.cargo] || 0) + 1; });
  const cargos = Object.entries(cargosCount).sort((a,b) => b[1]-a[1]);
  const maxC = Math.max(1, ...cargos.map(([,c]) => c));
  const rankContainer = document.getElementById('rank');
  if (rankContainer) rankContainer.innerHTML = cargos.map(([cargo, c]) => '<div class="rank-row"><div class="rank-head"><span>' + cargo + '</span><span class="n">' + c + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + ((c/maxC)*100) + '%"></div></div></div>').join('');
  
  // Ranking de setores
  const setoresCount = { Operacional: 0, ADM: 0 };
  funcionarios.forEach(f => { if (f.setor === 'Operacional') setoresCount.Operacional++; else if (f.setor === 'ADM') setoresCount.ADM++; });
  const setores = Object.entries(setoresCount).sort((a,b) => b[1]-a[1]);
  const maxS = Math.max(1, ...setores.map(([,c]) => c));
  const rankSetorContainer = document.getElementById('rankSetor');
  if (rankSetorContainer) rankSetorContainer.innerHTML = setores.map(([setor, c]) => '<div class="rank-row"><div class="rank-head"><span>' + setor + '</span><span class="n">' + c + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + ((c/maxS)*100) + '%"></div></div></div>').join('');
}

// ==================== OBRAS ====================
export async function carregarObras() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  const tbody = document.getElementById('tbodyObras');
  if (tbody) tbody.innerHTML = obras.map(o => '<tr><td class="cell-strong"><a href="obra.html?id=' + o.id + '">' + o.nome + '</a></td><td class="cell-muted">' + (o.localizacao || '') + '</td><td class="cell-muted">' + funcionarios.filter(f => f.obraId === o.id).length + '</td><td><button class="btn btn-sm" onclick="location.href=\'obra.html?id=' + o.id + '\'">Ver</button><table></tr>').join('');
}

export async function adicionarObra(nome, localizacao) { await addObra({ nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase(), ativo: true }); await carregarObras(); }

// ==================== FUNCIONÁRIOS ====================
export async function getTodosFuncionarios() { return await getFuncionarios(); }
export { getFuncionarios, addFuncionario, deleteFuncionario, updateFuncionario };

// ==================== USUÁRIOS ====================
export async function carregarUsuarios() { return await getUsuarios(); }
export { getUsuarios, addUsuario, updateUsuario, deleteUsuario };
