import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { NovaObraDialog } from "@/components/nova-obra-dialog";
import { useObras, useFuncionarios } from "@/lib/store";

export const Route = createFileRoute("/obras/")({ component: ObrasPage });

function ObrasPage() {
  const obras = useObras();
  const funcionarios = useFuncionarios();
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => obras.filter((o) =>
      o.nome.toLowerCase().includes(q.toLowerCase()) ||
      o.localizacao.toLowerCase().includes(q.toLowerCase()),
    ),
    [q, obras],
  );

  return (
    <div>
      <PageHeader title="Obras" action={<NovaObraDialog />} />

      <div className="mb-6 flex gap-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou localização"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium">Obra</th>
              <th className="px-4 py-3 text-left font-medium">Localização</th>
              <th className="px-4 py-3 text-left font-medium">Início</th>
              <th className="px-4 py-3 text-left font-medium">Efetivo</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const efetivo = funcionarios.filter((f) => f.obraId === o.id && f.status === "Ativo").length;
              return (
                <tr key={o.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <Link to={`/obras/${o.id}`} className="text-primary hover:underline font-medium">
                      {o.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {o.localizacao}
                  </td>
                  <td className="px-4 py-3">{o.inicio}</td>
                  <td className="px-4 py-3">{efetivo} ativos</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

