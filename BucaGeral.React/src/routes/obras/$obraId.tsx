import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin } from "lucide-react";
import { obrasMock, funcionariosMock } from "@/lib/mock-data";

export const Route = createFileRoute("/obras/$obraId")({
  component: ObraDetail,
  notFoundComponent: () => (
    <AppShell>
      <p className="text-muted-foreground">Obra não encontrada.</p>
    </AppShell>
  ),
});

function ObraDetail() {
  const { obraId } = Route.useParams();
  const obra = obrasMock.find((o) => o.id === obraId);
  if (!obra) throw notFound();
  const funcionarios = funcionariosMock.filter((f) => f.obraId === obraId);

  return (
    <AppShell>
      <Link to="/obras" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Voltar para obras
      </Link>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{obra.nome}</h1>
          <Badge variant={obra.ativo ? "default" : "secondary"}>
            {obra.ativo ? "Ativa" : "Encerrada"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {obra.localizacao} · Início {new Date(obra.dataInicio).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{f.cargo}</TableCell>
                  <TableCell>{new Date(f.dataAdmissao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={f.ativo ? "default" : "secondary"}>
                      {f.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {funcionarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Nenhum funcionário alocado nesta obra.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
