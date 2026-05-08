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
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const counts = meses.map((_, i) => funcs.filter(f => f.dataAdmissao && new Date(f.dataAdmissao).getMonth() === i && new Date(f.dataAdmissao).getFullYear() === 2026).length);
  const max = Math.max(1, ...counts);
  const bars = document.getElementById('bars'); if(bars) bars.innerHTML = meses.map((m, i) => '<div class="col"><div class="bar" style="height:'+((counts[i]/max)*100)+'%"></div><div class="lbl">'+m+'</div></div>').join('');
  const cargos = {}; funcs.forEach(f => cargos[f.cargo] = (cargos[f.cargo]||0)+1);
  const sorted = Object.entries(cargos).sort((a,b)=>b[1]-a[1]); const maxC = sorted[0]?.[1]||1;
  const rank = document.getElementById('rank'); if(rank) rank.innerHTML = sorted.map(([c, v]) => '<div class="rank-row"><div class="rank-head"><span>'+c+'</span><span>'+v+'</span></div><div class="bar-track"><div class="bar-fill" style="width:'+(v/maxC*100)+'%"></div></div></div>').join('');
  const setores = { Operacional: funcs.filter(f=>f.setor==='Operacional').length, ADM: funcs.filter(f=>f.setor==='ADM').length };
  const maxS = Math.max(1, setores.Operacional, setores.ADM);
  const rankSetor = document.getElementById('rankSetor'); if(rankSetor) rankSetor.innerHTML = Object.entries(setores).map(([s, v]) => '<div class="rank-row"><div class="rank-head"><span>'+s+'</span><span>'+v+'</span></div><div class="bar-track"><div class="bar-fill" style="width:'+(v/maxS*100)+'%"></div></div></div>').join('');
}

export async function carregarObras() {
  const obras = await getObras(); const funcs = await getFuncionarios();
  const tbody = document.getElementById('tbodyObras'); if (!tbody) return;
  tbody.innerHTML = obras.map(o => '<tr><td class="cell-strong"><a href="obra.html?id='+o.id+'">'+o.nome+'</a></td><td class="cell-muted">'+ (o.localizacao||'') +'</a></td><td class="cell-muted">'+ funcs.filter(f=>f.obraId===o.id).length +'</a><td><button class="btn btn-sm btn-warning" onclick="editarObra(\''+o.id+'\',\''+o.nome+'\',\''+o.localizacao+'\')">✏️</button> <button class="btn btn-sm btn-danger" onclick="excluirObra(\''+o.id+'\')">🗑️</button> <button class="btn btn-sm" onclick="location.href=\'obra.html?id='+o.id+'\'">Ver</button></a></td>').join('');
}
window.editarObra = (id, nome, localizacao) => { document.getElementById('editObraId').value = id; document.getElementById('editNomeObra').value = nome; document.getElementById('editLocalizacaoObra').value = localizacao; document.getElementById('modalEditarObra').style.display = 'flex'; };
window.excluirObra = async (id) => { if(confirm('Excluir esta obra?')){ await deleteObra(id); await carregarObras(); } };
export async function adicionarObra(nome, localizacao) { await addObra({ nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase(), dataInicio: new Date().toISOString(), ativo: true }); await carregarObras(); }
export async function atualizarObra(id, nome, localizacao) { await updateObra(id, { nome: nome.toUpperCase(), localizacao: localizacao.toUpperCase() }); await carregarObras(); }

export async function carregarFuncionarios(obraId = null) {
  const obras = await getObras(); const funcs = obraId ? await getFuncionarios(obraId) : await getFuncionarios();
  const tbody = document.getElementById('tbodyFuncionarios'); if (!tbody) return;
  tbody.innerHTML = funcs.map(f => { const obraNome = obras.find(o=>o.id===f.obraId)?.nome||'N/A'; return '<tr><td class="cell-strong">'+ (f.re||'') +'</a><td>'+ (f.nome||'') +'</a><td>'+ (f.cargo||'') +'</a><td>'+ (f.dataAdmissao?new Date(f.dataAdmissao).toLocaleDateString():'') +'</a><td>'+ (f.nascimento?new Date(f.nascimento).toLocaleDateString():'') +'</a><td>'+ (f.cbo||'') +'</a><td>'+ (f.exp30?new Date(f.exp30).toLocaleDateString():'') +'</a><td>'+ (f.exp60?new Date(f.exp60).toLocaleDateString():'') +'</a><td>'+ (f.salarioHora||'') +'</a><td>'+ (f.salarioMes||'') +'</a><td>'+ (f.setor||'') +'</a><td>'+ (f.tipoVinculo||'') +'</a><td>'+ obraNome +'</a><td><span class="badge '+(f.situacao==='Ativo'?'on':'')+'">'+(f.situacao||'Ativo')+'</span></a><td><button class="btn btn-sm btn-warning" onclick="editarFuncionario(\''+f.id+'\')">✏️</button> <button class="btn btn-sm btn-danger" onclick="excluirFuncionario(\''+f.id+'\')">🗑️</button></a></tr>'; }).join('');
}

export { getObras, addObra, deleteObra, updateObra, getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario, getUsuarios, addUsuario };