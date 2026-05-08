// app.js - Versão completa para frontend estático com Firebase
import { 
  auth, 
  login, 
  logout, 
  onAuth,
  getObras, 
  addObra, 
  updateObra, 
  deleteObra,
  getFuncionarios, 
  addFuncionario, 
  updateFuncionario, 
  deleteFuncionario,
  getUsuarios, 
  addUsuario, 
  updateUsuario, 
  deleteUsuario
} from './firebase-config.js';

let usuarioLogado = null;
let todasObras = [];
let todosFuncionarios = [];

// ==================== AUTENTICAÇÃO ====================
onAuth((user) => {
  if (user) {
    usuarioLogado = { uid: user.uid, email: user.email, nome: user.displayName || user.email.split('@')[0] };
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    if (!window.location.pathname.includes('inicio.html') && 
        !window.location.pathname.includes('obras.html') && 
        !window.location.pathname.includes('funcionarios.html') && 
        !window.location.pathname.includes('obra.html') && 
        !window.location.pathname.includes('usuarios.html')) {
      window.location.href = 'inicio.html';
    }
  } else {
    localStorage.removeItem('usuario');
    if (window.location.pathname.includes('inicio.html') || 
        window.location.pathname.includes('obras.html') || 
        window.location.pathname.includes('funcionarios.html') || 
        window.location.pathname.includes('obra.html') || 
        window.location.pathname.includes('usuarios.html')) {
      window.location.href = 'login.html';
    }
  }
});

export async function fazerLogin(email, senha) {
  try {
    await login(email, senha);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function fazerLogout() {
  await logout();
}

// ==================== SIDEBAR ====================
function renderSidebar(active) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">B</div>
        <div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div>
      </div>
      <nav class="sidebar-nav">${items.map(i => `<a href="${i.url}" class="${active === i.id ? 'active' : ''}">${i.icon}<span>${i.label}</span></a>`).join('')}</nav>
      <div class="sidebar-foot">
        <div class="who">${usuario.nome || 'admin'}</div>
        <div class="email">${usuario.email || ''}</div>
        <a href="#" onclick="fazerLogout(); return false;" class="btn-logout"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Sair</a>
      </div>
    </aside>
  `;
}

export function mountLayout(active) {
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
}

// ==================== INÍCIO ====================
export async function renderInicio() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  todasObras = obras;
  todosFuncionarios = funcionarios;
  
  document.getElementById("stat-obras").textContent = obras.length;
  document.getElementById("stat-func").textContent = funcionarios.length;
  
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const counts = meses.map((_, i) => funcionarios.filter(f => {
    if (!f.dataAdmissao) return false;
    const d = new Date(f.dataAdmissao);
    return d.getFullYear() === 2026 && d.getMonth() === i;
  }).length);
  const max = Math.max(1, ...counts);
  document.getElementById("bars").innerHTML = meses.map((m, i) => `<div class="col"><div class="bar" style="height:${(counts[i]/max)*100}%"></div><div class="lbl">${m}</div></div>`).join("");
  
  const cargosCount = funcionarios.reduce((acc, f) => { acc[f.cargo] = (acc[f.cargo]||0)+1; return acc; }, {});
  const cargos = Object.entries(cargosCount).sort((a,b) => b[1]-a[1]);
  const maxC = Math.max(1, ...cargos.map(([,c]) => c));
  document.getElementById("rank").innerHTML = cargos.map(([cargo, c]) => `<div class="rank-row"><div class="rank-head"><span>${cargo}</span><span class="n">${c}</span></div><div class="bar-track"><div class="bar-fill" style="width:${(c/maxC)*100}%"></div></div></div>`).join("");
}

// ==================== OBRAS ====================
export async function carregarObras() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  todasObras = obras;
  todosFuncionarios = funcionarios;
  
  const tbody = document.getElementById('tbodyObras');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (const o of obras) {
    const qtdFunc = funcionarios.filter(f => f.obraId === o.id).length;
    tbody.innerHTML += `<tr><td class="cell-strong"><a href="obra.html?id=${o.id}">${o.nome}</a><\/td><td>${o.localizacao || ''}<\/td><td>${qtdFunc}<\/td><td><button class="btn btn-sm" onclick="location.href='obra.html?id=${o.id}'">Ver</button><\/td><\/tr>`;
  }
}

export async function adicionarObra(nome, localizacao) {
  await addObra({ nome, localizacao, dataInicio: new Date().toISOString(), ativo: true });
  await carregarObras();
}

export async function atualizarObra(id, dados) {
  await updateObra(id, dados);
  await carregarObras();
}

export async function excluirObra(id) {
  if (confirm('Excluir esta obra?')) {
    await deleteObra(id);
    await carregarObras();
  }
}

// ==================== DETALHE OBRA ====================
export async function carregarDetalheObra() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  
  const obras = await getObras();
  const obra = obras.find(o => o.id === id);
  if (!obra) return;
  
  document.getElementById('obraNome').innerText = obra.nome;
  const funcionarios = await getFuncionarios(id);
  
  renderCards(funcionarios);
  renderTabelaFuncionarios(funcionarios);
  
  document.getElementById('searchInput')?.addEventListener('input', () => filtrarTabelaFuncionarios(funcionarios));
  document.getElementById('importarBtn')?.addEventListener('click', () => alert('Importação via Firebase será implementada'));
  document.getElementById('apagarTodosBtn')?.addEventListener('click', () => alert('Apagar todos será implementado'));
}

function renderCards(funcionarios) {
  const tipos = { 
    'Total Geral': funcionarios.length, 
    'Efetivo': funcionarios.filter(f => f.tipoVinculo === 'Efetivo').length,
    'PJ': funcionarios.filter(f => f.tipoVinculo === 'PJ').length,
    'Operacional': funcionarios.filter(f => f.setor === 'Operacional').length,
    'ADM': funcionarios.filter(f => f.setor === 'ADM').length,
    'Mobilização': funcionarios.filter(f => f.tipoVinculo === 'Mobilização').length,
    'Alteração de Função': funcionarios.filter(f => f.tipoVinculo === 'Alteração de Função').length,
    'Terceiros': funcionarios.filter(f => f.tipoVinculo === 'Terceiros').length
  };
  
  const panel = document.getElementById('statsPanel');
  if (!panel) return;
  panel.innerHTML = '';
  for (const [label, value] of Object.entries(tipos)) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
    card.onclick = () => filtrarPorTipo(funcionarios, label);
    panel.appendChild(card);
  }
}

function filtrarPorTipo(funcionarios, tipo) {
  let filtrados;
  if (tipo === 'Total Geral') filtrados = funcionarios;
  else if (tipo === 'Efetivo' || tipo === 'PJ' || tipo === 'Mobilização' || tipo === 'Alteração de Função' || tipo === 'Terceiros') {
    filtrados = funcionarios.filter(f => f.tipoVinculo === tipo);
  } else {
    filtrados = funcionarios.filter(f => f.setor === tipo);
  }
  renderTabelaFuncionarios(filtrados);
}

function filtrarTabelaFuncionarios(funcionarios) {
  const busca = document.getElementById('searchInput')?.value.toLowerCase();
  const filtrados = busca ? funcionarios.filter(f => f.nome?.toLowerCase().includes(busca) || f.cargo?.toLowerCase().includes(busca)) : funcionarios;
  renderTabelaFuncionarios(filtrados);
}

function renderTabelaFuncionarios(funcionarios) {
  const tbody = document.getElementById('tbody');
  if (!tbody) return;
  tbody.innerHTML = funcionarios.map(f => `
    <tr>
      <td>${f.re || '-'}<\/td>
      <td class="cell-strong">${f.nome || ''}<\/td>
      <td>${f.cargo || ''}<\/td>
      <td>${f.setor || '-'}<\/td>
      <td>${f.tipoVinculo || '-'}<\/td>
      <td>${f.dataAdmissao ? new Date(f.dataAdmissao).toLocaleDateString() : '-'}<\/td>
      <td>${f.situacao || 'Ativo'}<\/td>
      <td><button class="btn btn-sm btn-warning" onclick="window.editarFuncionario('${f.id}')">Editar</button> 
            <button class="btn btn-sm btn-danger" onclick="window.excluirFuncionario('${f.id}')">Excluir</button><\/td>
    <\/tr>
  `).join('');
}

window.editarFuncionario = (id) => alert(`Editar funcionário ${id} será implementado`);
window.excluirFuncionario = async (id) => {
  if (confirm('Excluir funcionário?')) {
    await deleteFuncionario(id);
    location.reload();
  }
};

// ==================== FUNCIONÁRIOS ====================
export async function carregarFuncionarios() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  todasObras = obras;
  todosFuncionarios = funcionarios;
  
  const obraId = document.getElementById('obraFilter')?.value || '';
  const busca = document.getElementById('searchInput')?.value.toLowerCase() || '';
  
  let filtrados = funcionarios;
  if (obraId) filtrados = filtrados.filter(f => f.obraId === obraId);
  if (busca) filtrados = filtrados.filter(f => f.nome?.toLowerCase().includes(busca) || f.cargo?.toLowerCase().includes(busca));
  
  const tbody = document.getElementById('tbody');
  if (!tbody) return;
  tbody.innerHTML = filtrados.map(f => {
    const obraNome = obras.find(o => o.id === f.obraId)?.nome || 'N/A';
    return `<tr>
      <td>${f.re || '-'}<\/td>
      <td class="cell-strong">${f.nome || ''}<\/td>
      <td>${f.cargo || ''}<\/td>
      <td>${obraNome}<\/td>
      <td>${f.tipoVinculo || '-'}<\/td>
      <td><button class="btn btn-sm btn-warning" onclick="window.editarFuncionario('${f.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="window.excluirFuncionario('${f.id}')">Excluir</button><\/td>
    <\/tr>`;
  }).join('');
  
  // Atualizar cards OBCAS
  renderCardsGlobal(funcionarios);
}

function renderCardsGlobal(funcionarios) {
  const tipos = { 
    'Total Geral': funcionarios.length, 
    'Efetivo': funcionarios.filter(f => f.tipoVinculo === 'Efetivo').length,
    'PJ': funcionarios.filter(f => f.tipoVinculo === 'PJ').length,
    'Operacional': funcionarios.filter(f => f.setor === 'Operacional').length,
    'ADM': funcionarios.filter(f => f.setor === 'ADM').length,
    'Mobilização': funcionarios.filter(f => f.tipoVinculo === 'Mobilização').length,
    'Alteração de Função': funcionarios.filter(f => f.tipoVinculo === 'Alteração de Função').length,
    'Terceiros': funcionarios.filter(f => f.tipoVinculo === 'Terceiros').length
  };
  
  const panel = document.getElementById('statsPanel');
  if (panel) {
    panel.innerHTML = '';
    for (const [label, value] of Object.entries(tipos)) {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
      panel.appendChild(card);
    }
  }
}

export async function adicionarFuncionario(funcionario) {
  await addFuncionario(funcionario);
  await carregarFuncionarios();
}

// ==================== USUÁRIOS ====================
export async function carregarUsuarios() {
  const usuarios = await getUsuarios();
  const tbody = document.getElementById('tbodyUsuarios');
  if (!tbody) return;
  tbody.innerHTML = usuarios.map(u => `<tr>
    <td class="cell-strong">${u.nome}<\/td>
    <td>${u.email}<\/td>
    <td>${u.perfil || 'Operador'}<\/td>
    <td>${u.obraId ? 'Vinculado' : 'RH Matriz'}<\/td>
    <td><button class="btn btn-sm btn-warning" onclick="window.editarUsuario('${u.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="window.excluirUsuario('${u.id}')">Excluir</button><\/td>
  <\/tr>`).join('');
}

window.editarUsuario = (id) => alert(`Editar usuário ${id} será implementado`);
window.excluirUsuario = async (id) => {
  if (confirm('Excluir usuário?')) {
    await deleteUsuario(id);
    await carregarUsuarios();
  }
};

// Exportações públicas
export { 
  getObras, getFuncionarios, getUsuarios,
  todasObras, todosFuncionarios
};
