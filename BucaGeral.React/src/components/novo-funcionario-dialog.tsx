import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addFuncionario, useObras } from "@/lib/store";

const todayBR = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export function NovoFuncionarioDialog({ obraIdFixo }: { obraIdFixo?: string }) {
  const obras = useObras();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [obraId, setObraId] = useState(obraIdFixo ?? obras[0]?.id ?? "");
  const [admissao, setAdmissao] = useState(todayBR());
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cargo || !obraId) return;
    addFuncionario({ nome, cargo, obraId, admissao, status });
    setNome(""); setCargo(""); setAdmissao(todayBR()); setStatus("Ativo");
    if (!obraIdFixo) setObraId(obras[0]?.id ?? "");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo funcionário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo funcionário</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Pedreiro" />
          </div>
          {!obraIdFixo && (
            <div className="space-y-2">
              <Label>Obra</Label>
              <Select value={obraId} onValueChange={setObraId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="admissao">Admissão</Label>
            <Input id="admissao" value={admissao} onChange={(e) => setAdmissao(e.target.value)} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "Ativo" | "Inativo")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar funcionário</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
