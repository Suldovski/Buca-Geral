import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { usuariosMockInitial, type Usuario } from "@/lib/mock-data";

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

