import { 
  auth, login, logout, onAuth,
  getObras, addObra, updateObra, deleteObra,
  getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario,
  getUsuarios, addUsuario, updateUsuario, deleteUsuario, getUsuarioByEmail
} from './firebase-config.js';

let currentUser = null;

export async function fazerLogin(email, senha) {
  try { await login(email, senha); return true; } catch(e) { return false; }
}
export async function fazerLogout() { await logout(); localStorage.clear(); window.location.href = 'login.html'; }

onAuth(async (user) => {
  if (user) {
    const usuarioSistema = await getUsuarioByEmail(user.email);
    currentUser = { uid: user.uid, email: user.email, nome: usuarioSistema?.nome, perfil: usuarioSistema?.perfil, obraId: usuarioSistema?.obraId };
    localStorage.setItem('usuario', JSON.stringify(currentUser));
  } else { localStorage.clear(); if (!location.pathname.includes('login.html')) location.href = 'login.html'; }
});

export function mountLayout(active) {
  const user = JSON.parse(localStorage.getItem('usuario') || '{}');
  const items = [
    { url: "inicio.html", label: "Início", id: "inicio", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>' },
    { url: "obras.html", label: "Obras", id: "obras", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h.01M15 8h.01"/></svg>' },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>' },
    { url: "usuarios.html", label: "Usuários", id: "usuarios", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>' }
  ];
  const sidebar = '<aside class="sidebar"><div class="sidebar-brand"><div class="logo">B</div><div><div class="name">Bucagrans</div><div class="sub">Construtora de Obras SA</div></div></div><nav class="sidebar-nav">' + items.map(i => '<a href="' + i.url + '" class="' + (active === i.id ? 'active' : '') + '">' + i.icon + '<span>' + i.label + '</span></a>').join('') + '</nav><div class="sidebar-foot"><div class="who">' + (user.nome || 'admin') + '</div><div class="email">' + (user.email || '') + '</div><a href="#" id="logoutBtn" class="btn-logout">Sair</a></div></aside>';
  const slot = document.getElementById('sidebar-slot'); if (slot) slot.outerHTML = sidebar;
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); fazerLogout(); });
}

export async function renderInicio() {
  const obras = await getObras(); const funcs = await getFuncionarios();
  document.getElementById('stat-obras').textContent = obras.length;
  document.getElementById('stat-func').textContent = funcs.length;
}

export async function carregarObras() {
  const obras = await getObras(); const funcs = await getFuncionarios();
  const tbody = document.getElementById('tbodyObras'); if (!tbody) return;
  tbody.innerHTML = obras.map(o => `
    <tr>
      <td class="cell-strong"><a href="obra.html?id=${o.id}">${o.nome}</a></td>
      <td class="cell-muted">${o.localizacao || ''}】,
      <td class="cell-muted">${funcs.filter(f => f.obraId === o.id).length}】,
      <td class="cell-muted"><button class="btn btn-sm btn-warning" onclick="editarObra('${o.id}','${o.nome}','${o.localizacao}')">✏️</button> <button class="btn btn-sm btn-danger" onclick="excluirObra('${o.id}')">🗑️</button> <button class="btn btn-sm" onclick="location.href='obra.html?id=${o.id}'">Ver</button>】,
    </tr>
  `).join('');
}

window.editarObra = (id, nome, localizacao) => {
  document.getElementById('editObraId').value = id;
  document.getElementById('editNomeObra').value = nome;
  document.getElementById('editLocalizacaoObra').value = localizacao;
  document.getElementById('modalEditarObra').style.display = 'flex';
};
window.excluirObra = async (id) => { if(confirm('Excluir esta obra?')){ await deleteObra(id); await carregarObras(); } };
export async function adicionarObra(nome, localizacao) { await addObra({ nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase(), dataInicio: new Date().toISOString(), ativo: true }); await carregarObras(); }
export async function atualizarObra(id, nome, localizacao) { await updateObra(id, { nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase() }); await carregarObras(); }

export async function carregarFuncionarios(obraId = null) {
  const obras = await getObras(); const funcs = obraId ? await getFuncionarios(obraId) : await getFuncionarios();
  const tbody = document.getElementById('tbodyFuncionarios'); if (!tbody) return;
  tbody.innerHTML = funcs.map(f => {
    const obraNome = obras.find(o=>o.id===f.obraId)?.nome||'N/A';
    return `<tr>
      <td class="cell-strong">${f.re || ''}】,
      <td class="cell-strong">${f.nome || ''}】,
      <td class="cell-muted">${f.cargo || ''}】,
      <td class="cell-muted">${f.setor || '-'}】,
      <td class="cell-muted">${f.tipoVinculo || '-'}】,
      <td class="cell-muted">${f.dataAdmissao ? new Date(f.dataAdmissao).toLocaleDateString() : '-'}】,
      <td class="cell-muted">${f.nascimento ? new Date(f.nascimento).toLocaleDateString() : '-'}】,
      <td class="cell-muted">${f.exp30 ? new Date(f.exp30).toLocaleDateString() : '-'}】,
      <td class="cell-muted">${f.exp60 ? new Date(f.exp60).toLocaleDateString() : '-'}】,
      <td class="cell-muted">${f.salarioHora ? 'R$ ' + f.salarioHora.toFixed(2) : '-'}】,
      <td class="cell-muted">${f.salarioMes ? 'R$ ' + f.salarioMes.toFixed(2) : '-'}】,
      <td class="cell-muted">${obraNome}】,
      <td class="cell-muted"><span class="badge ${f.situacao === 'Ativo' ? 'on' : ''}">${f.situacao || 'Ativo'}</span>】,
      <td class="cell-muted"><button class="btn btn-sm btn-warning" onclick="editarFuncionario('${f.id}')">✏️</button> <button class="btn btn-sm btn-danger" onclick="excluirFuncionario('${f.id}')">🗑️</button>】,
    </tr>`;
  }).join('');
}

export { getObras, addObra, deleteObra, updateObra, getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario, getUsuarios, addUsuario };