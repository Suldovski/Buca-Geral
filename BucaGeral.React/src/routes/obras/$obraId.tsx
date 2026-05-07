import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { NovoFuncionarioDialog } from "@/components/novo-funcionario-dialog";
import { useObras, useFuncionarios } from "@/lib/store";

export const Route = createFileRoute("/obras/$obraId")({
  component: ObraDetalhePage,
  notFoundComponent: () => (
    <div>
      <p className="text-muted-foreground">Obra não encontrada.</p>
      <Link to="/obras" className="text-primary hover:underline">Voltar</Link>
    </div>
  ),
});

function ObraDetalhePage() {
  const { obraId } = Route.useParams();
  const obras = useObras();
  const funcionarios = useFuncionarios();
  const obra = obras.find((o) => o.id === obraId);
  if (!obra) throw notFound();

  const equipe = funcionarios.filter((f) => f.obraId === obraId);
  const ativos = equipe.filter((f) => f.status === "Ativo").length;

  return (
    <div>
      <Link to="/obras" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para Obras
      </Link>

      <PageHeader title={obra.nome} action={<NovoFuncionarioDialog obraIdFixo={obraId} />} />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Info icon={<MapPin className="h-5 w-5" />} label="Localização" value={obra.localizacao} />
        <Info icon={<Calendar className="h-5 w-5" />} label="Início" value={obra.inicio} />
        <Info icon={<Users className="h-5 w-5" />} label="Efetivo ativo" value={`${ativos} de ${equipe.length}`} extra={<StatusBadge status={obra.status} />} />
      </div>

      <h3 className="text-lg font-semibold mb-4">Funcionários da obra</h3>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Cargo</th>
              <th className="px-4 py-3 text-left font-medium">Admissão</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {equipe.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum funcionário nesta obra ainda.
                </td>
              </tr>
            ) : equipe.map((f) => (
              <tr key={f.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{f.nome}</td>
                <td className="px-4 py-3">{f.cargo}</td>
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

function Info({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{value}</p>
        {extra}
      </div>
    </div>
  );
}
