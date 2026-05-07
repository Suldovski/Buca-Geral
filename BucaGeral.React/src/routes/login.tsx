import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold">Bucagrans</h1>
            <p className="text-xs text-muted-foreground">Construtora de Obras SA</p>
          </div>
        </div>
        <h2 className="mb-1 text-2xl font-semibold">Entrar</h2>
        <p className="mb-6 text-sm text-muted-foreground">Acesse o painel de controle.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <Button className="w-full" type="submit">Entrar</Button>
        </form>
      </div>
    </div>
  );
}
