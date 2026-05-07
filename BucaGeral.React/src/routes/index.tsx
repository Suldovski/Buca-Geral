import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { obrasMock, funcionariosMock } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const stats = [
    { label: "Obras", value: obrasMock.length, icon: Building2, to: "/obras" },
    { label: "Funcionários", value: funcionariosMock.length, icon: Users, to: "/funcionarios" },
  ];

  // Contratações por mês (2026)
  const ano = 2026;
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const porMes = meses.map((mes, idx) => ({
    mes,
    contratados: funcionariosMock.filter(f => new Date(f.dataAdmissao).getFullYear() === ano && new Date(f.dataAdmissao).getMonth() === idx).length,
  }));

  // Cargos mais frequentes
  const cargos: Record<string, number> = {};
  funcionariosMock.forEach(f => { cargos[f.cargo] = (cargos[f.cargo] || 0) + 1; });
  const topCargos = Object.entries(cargos).map(([cargo, total]) => ({ cargo, total })).sort((a,b) => b.total - a.total).slice(0, 5);

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Início</h1>
        <p className="text-muted-foreground">Visão geral do efetivo e obras.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="border-border/60 transition-all hover:shadow-lg cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-4xl font-semibold mt-2">{s.value}</p>
                  </div>
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <s.icon className="size-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contratações por mês ({ano})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="contratados" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funções com mais funcionários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCargos.map(({ cargo, total }) => {
              const max = topCargos[0]?.total || 1;
              const pct = (total / max) * 100;
              return (
                <div key={cargo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cargo}</span>
                    <span className="text-muted-foreground">{total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
