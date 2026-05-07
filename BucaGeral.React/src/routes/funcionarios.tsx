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

export const Route = createFileRoute("/funcionarios")({
  component: FuncionariosPage,
});

function FuncionariosPage() {
  const [q, setQ] = useState("");
  const [obraId, setObraId] = useState<string>("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [funcionarios, setFuncionarios] = useState(funcionariosMock);
  const [novoFunc, setNovoFunc] = useState({
    nome: "",
    cargo: "",
    obraId: "",
    dataAdmissao: "",
  });

  const filtered = funcionarios.filter((f) => {
    const matchQ = f.nome.toLowerCase().includes(q.toLowerCase()) || f.cargo.toLowerCase().includes(q.toLowerCase());
    const matchObra = obraId === "todas" || f.obraId === obraId;
    return matchQ && matchObra;
  });

  const obraNome = (id: string) => obrasMock.find((o) => o.id === id)?.nome ?? "—";

  const handleSalvarFunc = async () => {
    // Validação
    const nome = novoFunc.nome.trim();
    const cargo = novoFunc.cargo.trim();
    const obraIdVal = novoFunc.obraId.trim();
    const dataAdmissao = novoFunc.dataAdmissao.trim();

    if (!nome || !cargo || !obraIdVal || !dataAdmissao) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    // Prevenir duplicatas
    if (funcionarios.some(f => f.nome.toLowerCase() === nome.toLowerCase() && f.obraId === obraIdVal)) {
      alert("Já existe um funcionário com este nome nesta obra");
      return;
    }

    setLoading(true);
    try {
      const novo = {
        id: `f${Date.now()}`,
        nome,
        cargo,
        obraId: obraIdVal,
        dataAdmissao,
        ativo: true,
      };
      setFuncionarios([...funcionarios, novo]);
      setModalOpen(false);
      setNovoFunc({ nome: "", cargo: "", obraId: "", dataAdmissao: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-6 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Efetivo registrado em todas as obras.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4 mr-2" /> Novo funcionário
        </Button>
      </header>

      <div className="flex gap-4 mb-12 flex-wrap items-center relative">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou cargo"
            className="pl-9 bg-background"
          />
        </div>
        <div className="relative">
          <Select value={obraId} onValueChange={setObraId}>
            <SelectTrigger className="w-[240px] bg-card border border-border shadow-sm rounded-md">
              <SelectValue placeholder="Filtrar por obra" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-md z-[9999]">
              <SelectItem value="todas">Todas as obras</SelectItem>
              {obrasMock.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="table">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell>{f.cargo}</TableCell>
                  <TableCell className="text-muted-foreground">{obraNome(f.obraId)}</TableCell>
                  <TableCell>{new Date(f.dataAdmissao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={f.ativo ? "default" : "secondary"} className="badge">
                      {f.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum funcionário encontrado.
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
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome completo"
              value={novoFunc.nome}
              onChange={(e) => setNovoFunc({ ...novoFunc, nome: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
            <Input
              placeholder="Cargo"
              value={novoFunc.cargo}
              onChange={(e) => setNovoFunc({ ...novoFunc, cargo: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
            <Select
              value={novoFunc.obraId}
              onValueChange={(val) => setNovoFunc({ ...novoFunc, obraId: val })}
            >
              <SelectTrigger className="bg-white border-2 border-gray-300">
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {obrasMock.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={novoFunc.dataAdmissao}
              onChange={(e) => setNovoFunc({ ...novoFunc, dataAdmissao: e.target.value })}
              className="bg-white border-2 border-gray-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarFunc} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
