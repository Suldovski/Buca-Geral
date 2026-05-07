import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addObra } from "@/lib/store";

const todayBR = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export function NovaObraDialog() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [inicio, setInicio] = useState(todayBR());
  const [status, setStatus] = useState<"Ativa" | "Encerrada">("Ativa");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !localizacao) return;
    addObra({ nome, localizacao, inicio, status });
    setNome(""); setLocalizacao(""); setInicio(todayBR()); setStatus("Ativa");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova obra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova obra</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Residencial Vista Mar" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input id="localizacao" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: Santos, SP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inicio">Início</Label>
            <Input id="inicio" value={inicio} onChange={(e) => setInicio(e.target.value)} placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "Ativa" | "Encerrada")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Encerrada">Encerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar obra</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
