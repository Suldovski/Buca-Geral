import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/usuarios")({ component: UsuariosPage });

function UsuariosPage() {
  const usuarios = [
    { id: "u1", nome: "João Silva", email: "joao@buca.com", perfil: "Admin", status: "Ativo" },
    { id: "u2", nome: "Maria Santos", email: "maria@buca.com", perfil: "Operador", status: "Ativo" },
    { id: "u3", nome: "Pedro Oliveira", email: "pedro@buca.com", perfil: "Visualizador", status: "Inativo" },
  ];

  return (
    <div>
      <PageHeader title="Usuários" />

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">E-mail</th>
              <th className="px-4 py-3 text-left font-medium">Perfil</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{u.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{u.perfil}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

