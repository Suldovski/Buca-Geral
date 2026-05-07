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
    <aside className="flex w-64 flex-col border-r bg-sidebar">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold">Bucagrans</h1>
            <p className="text-xs text-muted-foreground">Construtora de Obras SA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 space-y-3">
        <div className="px-2 text-xs">
          <p className="font-medium">admin</p>
          <p className="text-muted-foreground">admin@gmail.com.br</p>
        </div>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="flex w-full items-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
