import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Building2, Users, UserCog, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/obras", label: "Obras", icon: Building2 },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/usuarios", label: "Usuários", icon: UserCog },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Bucagrans</h1>
          <p className="text-xs text-muted-foreground">Construtora de Obras SA</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-2 text-xs">
            <p className="font-medium truncate">{user.nome}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children ?? <Outlet />}</main>
    </div>
  );
}
