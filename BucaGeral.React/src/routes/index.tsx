import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { useObras, useFuncionarios } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Inicio });

function Inicio() {
  const obras = useObras();
  const funcionarios = useFuncionarios();
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const chartData = meses.map((m, i) => ({
    mes: m,
    total: funcionarios.filter((f) => {
      const [, mm, yyyy] = f.admissao.split("/");
      return Number(mm) === i + 1 && yyyy === "2026";
    }).length,
  }));

  const cargosCount = funcionarios.reduce<Record<string, number>>((acc, f) => {
    acc[f.cargo] = (acc[f.cargo] || 0) + 1; return acc;
  }, {});
  const cargos = Object.entries(cargosCount).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...cargos.map(([, c]) => c));

  return (
    <div>
      <PageHeader title="Início" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card title="Obras" value={obras.length} icon={<Building2 className="h-8 w-8" />} />
        <Card title="Funcionários" value={funcionarios.length} icon={<Users className="h-8 w-8" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-6">Funcionários contratados por mês (2026)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold mb-6">Funções com mais funcionários</h3>
          <div className="space-y-4">
            {cargos.map(([cargo, count]) => (
              <div key={cargo}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{cargo}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold mt-2">{value}</p>
        </div>
        <div className="text-primary opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
}
