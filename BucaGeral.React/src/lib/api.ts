import { Obra, Funcionario, Usuario } from './mock-data';

const API_BASE = 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
    
    if (!res.ok) {
      let errorMsg = `Erro ${res.status}`;
      try {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await res.json();
          errorMsg = data.message || data.error || errorMsg;
        }
      } catch {
        errorMsg = `Erro ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      request<{ uid: string; email: string; nome: string }>('/Auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
  },
  obras: {
    listar: () => request<Obra[]>('/obras'),
    criar: (data: Obra) => request<Obra>('/obras', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: Partial<Obra>) => request<Obra>(`/obras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id: string) => request<void>(`/obras/${id}`, { method: 'DELETE' }),
    buscarPorId: (id: string) => request<Obra>(`/obras/${id}`),
  },
  funcionarios: {
    listar: () => request<Funcionario[]>('/funcionarios'),
    criar: (data: Funcionario) => request<Funcionario>('/funcionarios', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: Partial<Funcionario>) => request<Funcionario>(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id: string) => request<void>(`/funcionarios/${id}`, { method: 'DELETE' }),
  },
  usuarios: {
    listar: () => request<Usuario[]>('/usuarios'),
    criar: (data: Usuario) => request<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    excluir: (uid: string) => request<void>(`/usuarios/${uid}`, { method: 'DELETE' }),
  },
};
