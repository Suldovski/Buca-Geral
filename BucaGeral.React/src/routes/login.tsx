import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await login(email, senha);
      navigate({ to: "/" });
    } catch (err) {
      setErro("Credenciais inválidas ou erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <HardHat className="size-6" />
            </div>
            <div>
              <h1 className="font-semibold text-xl">Bucagrans</h1>
              <p className="text-xs text-muted-foreground">Construtora de Obras SA</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-1">Entrar</h2>
          <p className="text-sm text-muted-foreground mb-6">Acesse o painel de controle.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
