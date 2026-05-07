export type Obra = {
  id: string;
  nome: string;
  localizacao: string;
  inicio: string;
  status: "Ativa" | "Encerrada";
};

export type Funcionario = {
  id: string;
  nome: string;
  cargo: string;
  obraId: string;
  admissao: string;
  status: "Ativo" | "Inativo";
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Operador" | "Visualizador";
  status: "Ativo" | "Inativo";
};

export const obras: Obra[] = [
  { id: "1", nome: "Residencial Vista Mar", localizacao: "Santos, SP", inicio: "11/03/2024", status: "Ativa" },
  { id: "2", nome: "Edifício Central Tower", localizacao: "São Paulo, SP", inicio: "31/08/2023", status: "Ativa" },
  { id: "3", nome: "Galpão Logístico Norte", localizacao: "Campinas, SP", inicio: "19/01/2024", status: "Ativa" },
  { id: "4", nome: "Reforma Sede Matriz", localizacao: "Rio de Janeiro, RJ", inicio: "09/05/2022", status: "Encerrada" },
];

export const funcionarios: Funcionario[] = [
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
  { id: "12", nome: "Beatriz Andrade", cargo: "Pedreiro", obraId: "2", admissao: "05/05/2026", status: "Ativo" },
];

export const usuarios: Usuario[] = [
  { id: "1", nome: "Admin Master", email: "admin@bucagrans.com.br", perfil: "Administrador", status: "Ativo" },
  { id: "2", nome: "Joana Engenheira", email: "joana@bucagrans.com.br", perfil: "Operador", status: "Ativo" },
  { id: "3", nome: "Marcos Diretor", email: "marcos@bucagrans.com.br", perfil: "Visualizador", status: "Inativo" },
];
