import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { NovoFuncionarioDialog } from "@/components/novo-funcionario-dialog";
import { useObras, useFuncionarios } from "@/lib/store";

export const Route = createFileRoute("/funcionarios")({ component: FuncionariosPage });

function FuncionariosPage() {
  const obras = useObras();
  const funcionarios = useFuncionarios();
  const [q, setQ] = useState("");
  const [obra, setObra] = useState("all");

  const filtered = useMemo(
    () => funcionarios.filter((f) =>
      (obra === "all" || f.obraId === obra) &&
      (f.nome.toLowerCase().includes(q.toLowerCase()) || f.cargo.toLowerCase().includes(q.toLowerCase())),
    ),
    [q, obra, funcionarios],
  );

  const obraNome = (id: string) => obras.find((o) => o.id === id)?.nome ?? "—";

  return (
    <div>
      <PageHeader title="Funcionários" action={<NovoFuncionarioDialog />} />

      <div className="mb-6 flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome ou cargo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={obra} onValueChange={setObra}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as obras</SelectItem>
            {obras.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Cargo</th>
              <th className="px-4 py-3 text-left font-medium">Obra</th>
              <th className="px-4 py-3 text-left font-medium">Admissão</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{f.nome}</td>
                <td className="px-4 py-3">{f.cargo}</td>
                <td className="px-4 py-3 text-muted-foreground">{obraNome(f.obraId)}</td>
                <td className="px-4 py-3">{f.admissao}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
