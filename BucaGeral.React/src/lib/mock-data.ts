export type Obra = {
  id: string;
  nome: string;
  localizacao: string;
  dataInicio: string;
  dataFim?: string;
  ativo: boolean;
};

export type Funcionario = {
  id: string;
  nome: string;
  cargo: string;
  obraId: string;
  dataAdmissao: string;
  ativo: boolean;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Operador" | "Visualizador";
  ativo: boolean;
};

export const obrasMock: Obra[] = [
  { id: "o1", nome: "Residencial Vista Mar", localizacao: "Santos, SP", dataInicio: "2024-03-12", ativo: true },
  { id: "o2", nome: "Edifício Central Tower", localizacao: "São Paulo, SP", dataInicio: "2023-09-01", ativo: true },
  { id: "o3", nome: "Galpão Logístico Norte", localizacao: "Campinas, SP", dataInicio: "2024-01-20", ativo: true },
  { id: "o4", nome: "Reforma Sede Matriz", localizacao: "Rio de Janeiro, RJ", dataInicio: "2022-05-10", ativo: false },
];

export const funcionariosMock: Funcionario[] = [
  { id: "f1", nome: "Carlos Almeida", cargo: "Engenheiro Civil", obraId: "o1", dataAdmissao: "2024-03-15", ativo: true },
  { id: "f2", nome: "Mariana Silva", cargo: "Mestre de Obras", obraId: "o1", dataAdmissao: "2024-04-02", ativo: true },
  { id: "f3", nome: "João Pedro Santos", cargo: "Pedreiro", obraId: "o1", dataAdmissao: "2024-04-10", ativo: true },
  { id: "f4", nome: "Ana Paula Costa", cargo: "Arquiteta", obraId: "o2", dataAdmissao: "2023-09-05", ativo: true },
  { id: "f5", nome: "Roberto Lima", cargo: "Eletricista", obraId: "o2", dataAdmissao: "2023-10-18", ativo: true },
  { id: "f6", nome: "Fernanda Rocha", cargo: "Encarregada", obraId: "o2", dataAdmissao: "2024-01-12", ativo: false },
  { id: "f7", nome: "Lucas Pereira", cargo: "Operador de Máquinas", obraId: "o3", dataAdmissao: "2024-02-01", ativo: true },
  { id: "f8", nome: "Patrícia Mendes", cargo: "Auxiliar Administrativo", obraId: "o3", dataAdmissao: "2024-02-20", ativo: true },
  { id: "f9", nome: "Gustavo Henrique", cargo: "Pintor", obraId: "o4", dataAdmissao: "2022-06-15", ativo: false },
];

export const usuariosMockInitial: Usuario[] = [
  { id: "u1", nome: "Admin Master", email: "admin@bucagrans.com.br", perfil: "Administrador", ativo: true },
  { id: "u2", nome: "Joana Engenheira", email: "joana@bucagrans.com.br", perfil: "Operador", ativo: true },
  { id: "u3", nome: "Marcos Diretor", email: "marcos@bucagrans.com.br", perfil: "Visualizador", ativo: false },
];
