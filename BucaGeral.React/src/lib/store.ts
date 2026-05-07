import { useSyncExternalStore } from "react";
import { api } from "./api";

// ---------- Estado base ----------
let _obras: any[] = [];
let _funcionarios: any[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

// ---------- Carregamento inicial (async) ----------
async function carregarDados() {
  try {
    const [obrasData, funcData] = await Promise.all([api.obras.listar(), api.funcionarios.listar()]);
    _obras = obrasData.map(o => ({
      id: o.id,
      nome: o.nome,
      localizacao: o.localizacao,
      inicio: new Date(o.dataInicio).toLocaleDateString("pt-BR"),
      status: o.ativo ? "Ativa" : "Encerrada"
    }));
    _funcionarios = funcData.map(f => ({
      id: f.id,
      nome: f.nome,
      cargo: f.cargo,
      obraId: f.obraId,
      admissao: new Date(f.dataAdmissao).toLocaleDateString("pt-BR"),
      status: f.ativo ? "Ativo" : "Inativo"
    }));
    emit();
  } catch (err) {
    console.error("Erro ao carregar dados da API", err);
  }
}
carregarDados();

// ---------- Hooks ----------
export const useObras = () => useSyncExternalStore(subscribe, () => _obras, () => _obras);
export const useFuncionarios = () => useSyncExternalStore(subscribe, () => _funcionarios, () => _funcionarios);

// ---------- Mutations ----------
export const addObra = async (obra: { nome: string; localizacao: string; inicio: string; status: "Ativa" | "Encerrada" }) => {
  try {
    const nova = await api.obras.criar({
      nome: obra.nome,
      localizacao: obra.localizacao,
      dataInicio: obra.inicio.split('/').reverse().join('-'),
      ativo: obra.status === "Ativa"
    });
    _obras = [..._obras, { ...nova, inicio: new Date(nova.dataInicio).toLocaleDateString("pt-BR"), status: nova.ativo ? "Ativa" : "Encerrada" }];
    emit();
  } catch (err) {
    console.error("Erro ao criar obra", err);
    alert("Erro ao criar obra. Verifique a conexão com a API.");
  }
};

export const addFuncionario = async (func: { nome: string; cargo: string; obraId: string; admissao: string; status: "Ativo" | "Inativo" }) => {
  try {
    const novo = await api.funcionarios.criar({
      nome: func.nome,
      cargo: func.cargo,
      obraId: func.obraId,
      dataAdmissao: func.admissao.split('/').reverse().join('-'),
      ativo: func.status === "Ativo"
    });
    _funcionarios = [..._funcionarios, { ...novo, admissao: new Date(novo.dataAdmissao).toLocaleDateString("pt-BR"), status: novo.ativo ? "Ativo" : "Inativo" }];
    emit();
  } catch (err) {
    console.error("Erro ao criar funcionário", err);
    alert("Erro ao criar funcionário. Verifique a conexão com a API.");
  }
};
