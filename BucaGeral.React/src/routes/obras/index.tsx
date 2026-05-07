import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { NovaObraDialog } from "@/components/nova-obra-dialog";
import { useObras, useFuncionarios } from "@/lib/store";

export const Route = createFileRoute("/obras")({ component: ObrasPage });

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
      setNovaObra({ nome: "", localizacao: "", dataInicio: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-6 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Obras</h1>
          <p className="text-muted-foreground">Gerencie as obras cadastradas.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4 mr-2" /> Nova obra
        </Button>
      </header>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou localização"
          className="pl-9 bg-background"
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="table">
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Efetivo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const total = funcionariosMock.filter(f => f.obraId === o.id && f.ativo).length;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      <Link to="/obras/$obraId" params={{ obraId: o.id }} className="hover:underline text-primary">
                        {o.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {o.localizacao}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(o.dataInicio).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{total} ativos</TableCell>
                    <TableCell>
                      <Badge variant={o.ativo ? "default" : "secondary"} className="badge">
                        {o.ativo ? "Ativa" : "Encerrada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhuma obra encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Obra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da obra"
              value={novaObra.nome}
              onChange={(e) => setNovaObra({ ...novaObra, nome: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
            <Input
              placeholder="Localização"
              value={novaObra.localizacao}
              onChange={(e) => setNovaObra({ ...novaObra, localizacao: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
            <Input
              type="date"
              value={novaObra.dataInicio}
              onChange={(e) => setNovaObra({ ...novaObra, dataInicio: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarObra} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
