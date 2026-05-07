import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

type AuthUser = { email: string; nome: string; uid?: string };
type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "bucagrans.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  let loginInProgress = false;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch (e) {
          console.error("Invalid stored auth data, clearing", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Prevent race conditions - reject if another login is in progress
    if (loginInProgress) {
      throw new Error("Login já em progresso");
    }

    loginInProgress = true;
    try {
      const data = await api.auth.login(email, password);
      const u = { email: data.email, nome: data.nome, uid: data.uid };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
    } finally {
      loginInProgress = false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
