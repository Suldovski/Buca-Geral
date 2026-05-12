import {
  login,
  logout,
  onAuth,
  getUsuarioByEmail,
  getObras,
  subscribeObras,
  addObra,
  updateObra,
  deleteObra,
  getFuncionarios,
  subscribeFuncionarios,
  addFuncionario,
  updateFuncionario,
  deleteFuncionario,
  subscribeUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario
} from "./firebase-config.js";

let usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "null");

function paginaPublica() {
  return location.pathname.endsWith("/index.html") || location.pathname.endsWith("/login.html") || location.pathname === "/";
}

export function requireAuth() {
  if (paginaPublica()) return;
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario) location.href = "index.html";
}

export async function fazerLogin(email, senha) {
  try {
    const user = await login(email, senha);
    const usuarioSistema = await getUsuarioByEmail(user.email);
    if (!usuarioSistema) {
      await logout();
      return false;
    }

    usuarioLogado = {
      uid: user.uid,
      email: user.email,
      nome: usuarioSistema.nome,
      perfil: usuarioSistema.perfil,
      obraId: usuarioSistema.obraId || null
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
    return true;
  } catch {
    return false;
  }
}

export async function fazerLogout() {
  await logout();
  localStorage.clear();
  location.href = "index.html";
}

onAuth((user) => {
  if (!user) {
    localStorage.removeItem("usuario");
    usuarioLogado = null;
    if (!paginaPublica()) location.href = "index.html";
  }
});

function navItems() {
  return [
    { url: "dashboard.html", label: "Dashboard", id: "dashboard" },
    { url: "funcionarios.html", label: "Funcionários", id: "funcionarios" },
    { url: "obras.html", label: "Obras", id: "obras" },
    { url: "usuarios.html", label: "Usuários", id: "usuarios" }
  ];
}

function renderSidebar(active) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">B</div>
        <div>
          <div class="name">Bucagrans</div>
          <div class="sub">Controle RH</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems().map((item) => `<a href="${item.url}" class="${active === item.id ? "active" : ""}"><span>${item.label}</span></a>`).join("")}
      </nav>
      <div class="sidebar-foot">
        <div class="who">${usuario.nome || "Usuário"}</div>
        <div class="email">${usuario.email || ""}</div>
        <a href="#" id="logout-button" class="btn-logout">Sair</a>
      </div>
    </aside>
  `;
}

export function mountLayout(active) {
  requireAuth();
  const slot = document.getElementById("sidebar-slot");
  if (slot) slot.outerHTML = renderSidebar(active);
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await fazerLogout();
    });
  }
}

export function observarEstatisticasDashboard(onChange) {
  let obras = [];
  let funcionarios = [];

  const emitir = () => {
    const porCargo = funcionarios.reduce((acc, f) => {
      const cargo = f.cargo || "Sem cargo";
      acc[cargo] = (acc[cargo] || 0) + 1;
      return acc;
    }, {});

    onChange({
      totalObras: obras.length,
      totalFuncionarios: funcionarios.length,
      totalAtivos: funcionarios.filter((f) => (f.situacao || "Ativo") === "Ativo").length,
      porCargo
    });
  };

  const unsubObras = subscribeObras((data) => {
    obras = data;
    emitir();
  });

  const unsubFuncionarios = subscribeFuncionarios(null, (data) => {
    funcionarios = data;
    emitir();
  });

  return () => {
    unsubObras();
    unsubFuncionarios();
  };
}

export {
  getObras,
  subscribeObras,
  addObra,
  updateObra,
  deleteObra,
  getFuncionarios,
  subscribeFuncionarios,
  addFuncionario,
  updateFuncionario,
  deleteFuncionario,
  subscribeUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"`]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
    "`": "&#96;"
  }[char]));
}

export function exportarCSV(nomeArquivo, colunas, linhas) {
  const header = `${colunas.map((coluna) => `"${String(coluna).replace(/"/g, '""')}"`).join(",")}\n`;
  const body = linhas.map((linha) => colunas.map((coluna) => {
    const valor = linha[coluna] ?? "";
    const texto = String(valor).replace(/"/g, '""');
    return `"${texto}"`;
  }).join(",")).join("\n");

  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
