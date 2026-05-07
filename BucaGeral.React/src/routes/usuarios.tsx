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

export const Route = createFileRoute("/usuarios")({
  component: UsuariosPage,
});

type FormState = { nome: string; email: string; perfil: Usuario["perfil"]; ativo: boolean };
const empty: FormState = { nome: "", email: "", perfil: "Operador", ativo: true };

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMockInitial);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const openNovo = () => {
    setEditId(null);
    setForm(empty);
    setError("");
    setOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditId(u.id);
    setForm({ nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo });
    setError("");
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const nome = form.nome.trim();
    const email = form.email.trim();

    if (!nome) {
      setError("Nome é obrigatório");
      return;
    }

    if (!email) {
      setError("E-mail é obrigatório");
      return;
    }

    if (!validateEmail(email)) {
      setError("E-mail inválido");
      return;
    }

    // Prevent duplicate emails (except when editing the same user)
    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== editId)) {
      setError("Já existe um usuário com este e-mail");
      return;
    }

    if (editId) {
      setUsuarios((prev) => prev.map((u) => (u.id === editId ? { ...u, nome, email, perfil: form.perfil, ativo: form.ativo } : u)));
    } else {
      setUsuarios((prev) => [...prev, { id: `u${Date.now()}`, nome, email, perfil: form.perfil, ativo: form.ativo }]);
    }
    setOpen(false);
  };

  const remover = (id: string) => {
    if (confirm("Remover este usuário?")) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuários</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNovo}>
              <Plus className="size-4" /> Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className="bg-white border-2 border-gray-300" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-white border-2 border-gray-300" />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil</Label>
                <Select value={form.perfil} onValueChange={(v) => setForm({ ...form, perfil: v as Usuario["perfil"] })}>
                  <SelectTrigger className="bg-white border-2 border-gray-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Operador">Operador</SelectItem>
                    <SelectItem value="Visualizador">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.ativo ? "ativo" : "inativo"} onValueChange={(v) => setForm({ ...form, ativo: v === "ativo" })}>
                  <SelectTrigger className="bg-white border-2 border-gray-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editId ? "Salvar" : "Cadastrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      <Card style={{ boxShadow: "var(--shadow-card)" }}>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.perfil}</TableCell>
                  <TableCell>
                    <Badge variant={u.ativo ? "default" : "secondary"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remover(u.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Nenhum usuário cadastrado.
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

