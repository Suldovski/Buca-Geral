import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Building2, Users, UserCog, HardHat, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Início", url: "/", icon: Home },
  { title: "Obras", url: "/obras", icon: Building2 },
  { title: "Funcionários", url: "/funcionarios", icon: Users },
  { title: "Usuários", url: "/usuarios", icon: UserCog },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <HardHat className="size-8 text-primary" />
          <div>
            <p className="font-bold">Bucagrans</p>
            <p className="text-xs text-muted-foreground">Construtora de Obras SA</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-2">
        <div className="px-2 text-xs">
          <p className="font-medium">admin</p>
          <p className="text-muted-foreground">admin@gmail.com.br</p>
        </div>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          <LogOut className="size-4" /> Sair
        </button>
      </div>
    </aside>
  );
}
