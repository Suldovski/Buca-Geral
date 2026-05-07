import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, MapPin } from "lucide-react";
import { useState } from "react";
import { obrasMock, funcionariosMock } from "@/lib/mock-data";

export const Route = createFileRoute("/obras")({
  component: ObrasPage,
});

function ObrasPage() {
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState(obrasMock);
  const [novaObra, setNovaObra] = useState({ nome: "", localizacao: "", dataInicio: "" });

  const filtered = obras.filter(o =>
    o.nome.toLowerCase().includes(q.toLowerCase()) ||
    o.localizacao.toLowerCase().includes(q.toLowerCase())
  );

  const handleSalvarObra = async () => {
    // Validação
    const nome = novaObra.nome.trim();
    const localizacao = novaObra.localizacao.trim();
    const dataInicio = novaObra.dataInicio.trim();

    if (!nome || !localizacao || !dataInicio) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    // Prevenir duplicatas
    if (obras.some(o => o.nome.toLowerCase() === nome.toLowerCase())) {
      alert("Já existe uma obra com este nome");
      return;
    }

    setLoading(true);
    try {
      const nova = { id: `o${Date.now()}`, nome, localizacao, dataInicio, ativo: true };
      setObras([...obras, nova]);
      setModalOpen(false);
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
