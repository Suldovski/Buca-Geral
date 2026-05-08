// app.js - Lógica unificada
import { 
  auth, login, logout, onAuth,
  getObras, addObra, updateObra, deleteObra,
  getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario,
  getUsuarios, addUsuario, updateUsuario, deleteUsuario
} from './firebase-config.js';

let usuarioLogado = null;
let todasObras = [];
let todosFuncionarios = [];

// ==================== AUTENTICAÇÃO ====================
export async function fazerLogin(email, senha) {
  try {
    await login(email, senha);
    return true;
  } catch (error) {
    console.error("Erro no login:", error);
    return false;
  }
}

export async function fazerLogout() {
  await logout();
}

// Observador de estado de autenticação (redireciona para login se não autenticado)
onAuth((user) => {
  if (user) {
    usuarioLogado = { uid: user.uid, email: user.email, nome: user.displayName || user.email.split('@')[0] };
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    
    const paginasProtegidas = ['inicio.html', 'obras.html', 'funcionarios.html', 'obra.html', 'usuarios.html'];
    const isProtegida = paginasProtegidas.some(pagina => window.location.pathname.includes(pagina));
    
    if (!isProtegida && !window.location.pathname.includes('login.html')) {
      window.location.href = 'inicio.html';
    }
  } else {
    localStorage.removeItem('usuario');
    const paginasProtegidas = ['inicio.html', 'obras.html', 'funcionarios.html', 'obra.html', 'usuarios.html'];
    const isProtegida = paginasProtegidas.some(pagina => window.location.pathname.includes(pagina));
    
    if (isProtegida) {
      window.location.href = 'login.html';
    }
  }
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
        <a href="#" id="logout-button">Sair</a>
      </div>
    </aside>
  `;
}

export function mountLayout(active) {
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
  
  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      fazerLogout();
    };
  }
}

// Funções para carregar dados (exemplo para 'inicio.html' e 'obras.html')
export async function carregarEstatisticas() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  todasObras = obras;
  todosFuncionarios = funcionarios;
  
  const elObras = document.getElementById('total-obras');
  const elFunc = document.getElementById('total-funcionarios');
  if (elObras) elObras.textContent = obras.length;
  if (elFunc) elFunc.textContent = funcionarios.length;
}

export async function carregarObras() {
  const obras = await getObras();
  const funcionarios = await getFuncionarios();
  todasObras = obras;
  todosFuncionarios = funcionarios;
  
  const container = document.getElementById('obras-list');
  if (container) {
    container.innerHTML = obras.map(obra => `
      <div class="obra-card">
        <h3>${obra.nome}</h3>
        <p>${obra.localizacao || 'Localização não informada'}</p>
        <p>Funcionários: ${funcionarios.filter(f => f.obraId === obra.id).length}</p>
        <button class="btn-ver-obra" data-id="${obra.id}">Ver Detalhes</button>
      </div>
    `).join('');
    document.querySelectorAll('.btn-ver-obra').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        window.location.href = `obra.html?id=${id}`;
      });
    });
  }
}

// Exportar funções necessárias para uso nas páginas HTML
export { 
  getObras, 
  addObra, 
  getFuncionarios, 
  addFuncionario, 
  updateFuncionario, 
  deleteFuncionario,
  getUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario
};

// Torna algumas funções acessíveis globalmente para uso em eventos inline no HTML (se necessário)
window.carregarEstatisticas = carregarEstatisticas;
window.carregarObras = carregarObras;
window.mountLayout = mountLayout;
window.fazerLogout = fazerLogout;
window.getObras = getObras;
window.getFuncionarios = getFuncionarios;
