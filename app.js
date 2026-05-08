// app.js - Versão com HTML correto (sem caracteres estranhos)
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
    if (!usuarioSistema) {
      await logout();
      return false;
    }
    usuarioLogado = {
      uid: user.uid,
      email: user.email,
      nome: usuarioSistema.nome,
      perfil: usuarioSistema.perfil,
      obraId: usuarioSistema.obraId
    };
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    return true;
  } catch (error) {
    console.error("Erro no login:", error);
    return false;
  }
}

export async function fazerLogout() {
  await logout();
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

onAuth((user) => {
  if (!user) localStorage.removeItem('usuario');
});

// ==================== SIDEBAR ====================
function renderSidebar(active) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a4 4 0 100-8M22 21v-2a4 4 0 00-3-3.87"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  return '<aside class="sidebar">' +
    '<div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div>' +
    '<nav class="sidebar-nav">' + items.map(i => '<a href="' + i.url + '" class="' + (active === i.id ? 'active' : '') + '">' + i.icon + '<span>' + i.label + '</span></a>').join('') + '</nav>' +
    '<div class="sidebar-foot"><div class="who">' + (usuario.nome || 'admin') + '</div><div class="email">' + (usuario.email || '') + '</div>' +
    '<a href="#" id="logout-button" class="btn-logout">Sair</a></div></aside>';
}

export function mountLayout(active) {
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) logoutBtn.onclick = (e) => { e.preventDefault(); fazerLogout(); };
}

// ==================== INÍCIO ====================
export async function renderInicio() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  document.getElementById('stat-obras').textContent = obras.length;
  document.getElementById('stat-func').textContent = funcionarios.length;
}

// ==================== OBRAS ====================
export async function carregarObras() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  const tbody = document.getElementById('tbodyObras');
  if (tbody) {
    tbody.innerHTML = obras.map(o => '<tr>' +
      '<td class="cell-strong"><a href="obra.html?id=' + o.id + '">' + (o.nome || '') + '</a></td>' +
      '<td>' + (o.localizacao || '') + '</td>' +
      '<td>' + funcionarios.filter(f => f.obraId === o.id).length + '</td>' +
      '<td><button class="btn btn-sm" onclick="location.href=\'obra.html?id=' + o.id + '\'">Ver</button></td>' +
    '</tr>').join('');
  }
}

export async function adicionarObra(nome, localizacao) {
  await addObra({ nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase(), ativo: true });
  await carregarObras();
}

// ==================== FUNCIONÁRIOS ====================
export async function carregarFuncionarios() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  const tbody = document.getElementById('tbodyFuncionarios');
  if (tbody) {
    tbody.innerHTML = funcionarios.map(f => {
      const obraNome = obras.find(o => o.id === f.obraId)?.nome || 'N/A';
      return '<tr>' +
        '<td class="cell-strong">' + (f.nome || '') + '</td>' +
        '<td class="cell-muted">' + (f.cargo || '') + '</td>' +
        '<td class="cell-muted">' + obraNome + '</td>' +
        '<td class="cell-muted">' + (f.tipoVinculo || 'Efetivo') + '</td>' +
        '<td class="cell-muted">' + (f.dataAdmissao ? new Date(f.dataAdmissao).toLocaleDateString() : '-') + '</td>' +
        '<td class="cell-muted"><span class="badge ' + (f.situacao === 'Ativo' ? 'on' : '') + '">' + (f.situacao || 'Ativo') + '</span></td>' +
        '<td><button class="btn btn-sm btn-warning" onclick="editarFuncionario(\'' + f.id + '\')">Editar</button> <button class="btn btn-sm btn-danger" onclick="excluirFuncionario(\'' + f.id + '\')">Excluir</button></td>' +
      '</tr>';
    }).join('');
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
  if (tbody) {
    tbody.innerHTML = usuarios.map(u => '<tr>' +
      '<td class="cell-strong">' + (u.nome || '') + '</td>' +
      '<td class="cell-muted">' + (u.email || '') + '</td>' +
      '<td class="cell-muted">' + (u.perfil || 'Operador') + '</td>' +
      '<td class="cell-muted">' + (u.obraId ? 'Vinculado' : 'RH Matriz') + '</td>' +
      '<td><button class="btn btn-sm btn-warning" onclick="alert(\'Editar ' + u.id + '\')">Editar</button> <button class="btn btn-sm btn-danger" onclick="alert(\'Excluir ' + u.id + '\')">Excluir</button></td>' +
    '</tr>').join('');
  }
}

// ==================== EXPORTAÇÕES ====================
export { 
  getObras, addObra,
  getFuncionarios, addFuncionario, deleteFuncionario, updateFuncionario,
  getUsuarios, addUsuario, updateUsuario, deleteUsuario
};
