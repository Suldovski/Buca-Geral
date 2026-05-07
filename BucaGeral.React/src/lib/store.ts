import { useSyncExternalStore } from "react";
import { obras as seedObras, funcionarios as seedFuncionarios, type Obra, type Funcionario } from "./mock-data";

let _obras: Obra[] = [...seedObras];
let _funcionarios: Funcionario[] = [...seedFuncionarios];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export const useObras = () => useSyncExternalStore(subscribe, () => _obras, () => _obras);
export const useFuncionarios = () => useSyncExternalStore(subscribe, () => _funcionarios, () => _funcionarios);

export const addObra = (o: Omit<Obra, "id">) => {
  _obras = [..._obras, { ...o, id: crypto.randomUUID() }];
  emit();
};

export const addFuncionario = (f: Omit<Funcionario, "id">) => {
  _funcionarios = [..._funcionarios, { ...f, id: crypto.randomUUID() }];
  emit();
};
