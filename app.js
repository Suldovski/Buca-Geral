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

function normalizarTextoAcesso(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function paginaPublica() {
  return location.pathname.endsWith("/index.html") || location.pathname.endsWith("/login.html") || location.pathname === "/" || location.pathname.endsWith("/");
}

export function requireAuth() {
  if (paginaPublica()) return;
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario) location.href = "index.html";
}

export async function fazerLogin(email, senha) {
  try {
    const user = await login(email, senha);

    let usuarioSistema = null;
    try {
      usuarioSistema = await getUsuarioByEmail(user.email);
    } catch (err) {
      console.warn("Usuário não encontrado em usuarios_sistema:", err);
    }

    usuarioLogado = {
      uid: user.uid,
      email: user.email,
      nome: usuarioSistema?.nome || "Usuário",
      perfil: usuarioSistema?.perfil || "user",
      obraId: usuarioSistema?.obraId || null
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
    return true;
  } catch (err) {
    console.error("Erro no login:", err);
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
    { url: "inicio.html", label: "Início", id: "inicio" },
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

export function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuario") || "null");
}

export function isRhMatriz(usuario = getUsuarioLogado()) {
  const perfil = normalizarTextoAcesso(usuario?.perfil);
  return perfil === "RH MATRIZ";
}

export function isRhObra(usuario = getUsuarioLogado()) {
  const perfil = normalizarTextoAcesso(usuario?.perfil);
  return perfil.startsWith("RH + ");
}

export function podeAcessarObra(obraId, usuario = getUsuarioLogado()) {
  if (!obraId) return false;
  if (isRhMatriz(usuario)) return true;
  return String(usuario?.obraId || "") === String(obraId);
}

export function filtrarObrasPorAcesso(obras = [], usuario = getUsuarioLogado()) {
  if (isRhMatriz(usuario)) return obras;
  return obras.filter((obra) => podeAcessarObra(obra.id, usuario));
}

export function filtrarFuncionariosPorAcesso(funcionarios = [], usuario = getUsuarioLogado()) {
  if (isRhMatriz(usuario)) return funcionarios;
  return funcionarios.filter((funcionario) => podeAcessarObra(funcionario.obraId, usuario));
}

function mesKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizarFuncionario(funcionario) {
  const funcao = funcionario.funcao || funcionario.cargo || "";
  return {
    ...funcionario,
    funcao,
    cargo: funcao,
    setor: funcionario.setor || "",
    tipoVinculo: funcionario.tipoVinculo || "Efetivo",
    cpf: funcionario.cpf || "",
    situacao: funcionario.situacao || "Ativo"
  };
}

export function formatarDataBR(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

export function formatarMoeda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return "-";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function obterContagensCards(funcionarios) {
  return {
    total: funcionarios.length,
    efetivo: funcionarios.filter((f) => (f.tipoVinculo || "") === "Efetivo").length,
    pj: funcionarios.filter((f) => (f.tipoVinculo || "") === "PJ").length,
    operacional: funcionarios.filter((f) => (f.setor || "") === "Operacional").length,
    adm: funcionarios.filter((f) => (f.setor || "") === "ADM").length,
    mobilizacao: funcionarios.filter((f) => (f.tipoVinculo || "") === "Mobilização").length,
    alteracao: funcionarios.filter((f) => (f.tipoVinculo || "") === "Alteração de Função").length,
    terceiros: funcionarios.filter((f) => (f.tipoVinculo || "") === "Terceiros").length
  };
}

export function calcularRanking(funcionarios, campo, limite = 5) {
  const mapa = funcionarios.reduce((acc, f) => {
    const valor = (f[campo] || "").trim() || "Não informado";
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(mapa)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limite);
}

export function calcularAdmissoes12Meses(funcionarios) {
  const agora = new Date();
  const meses = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    meses.push({
      key: mesKey(d),
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
      total: 0
    });
  }

  const idx = new Map(meses.map((m, i) => [m.key, i]));
  funcionarios.forEach((f) => {
    if (!f.dataAdmissao) return;
    const data = new Date(f.dataAdmissao);
    if (Number.isNaN(data.getTime())) return;
    const key = mesKey(data);
    const pos = idx.get(key);
    if (pos !== undefined) meses[pos].total += 1;
  });

  return meses;
}

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
