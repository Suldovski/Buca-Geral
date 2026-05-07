const API_BASE = 'http://localhost:5000/api';

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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
    listar: () => request<any[]>('/obras'),
    criar: (data: any) => request('/obras', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: any) => request(`/obras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id: string) => request(`/obras/${id}`, { method: 'DELETE' }),
  },
  funcionarios: {
    listar: () => request<any[]>('/funcionarios'),
    criar: (data: any) => request('/funcionarios', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: string, data: any) => request(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluir: (id: string) => request(`/funcionarios/${id}`, { method: 'DELETE' }),
  },
  usuarios: {
    listar: () => request<any[]>('/usuarios'),
    criar: (data: any) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    excluir: (uid: string) => request(`/usuarios/${uid}`, { method: 'DELETE' }),
  },
};
