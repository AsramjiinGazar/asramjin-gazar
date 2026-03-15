import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, setToken, hasToken, type ApiUser, type ApiProfile } from "@/lib/api";

interface AuthState {
  user: ApiUser | null;
  profile: ApiProfile | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: hasToken() ? localStorage.getItem("token") : null,
    loading: true,
  });

  const refreshMe = useCallback(async () => {
    if (!hasToken()) {
      setState((s) => ({ ...s, user: null, profile: null, loading: false }));
      return;
    }
    try {
      const res = await auth.me();
      setState((s) => ({ ...s, user: res.user, profile: res.profile, loading: false }));
    } catch {
      localStorage.removeItem("token");
      setState((s) => ({ ...s, user: null, profile: null, token: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login(email, password);
    setToken(res.token);
    setState((s) => ({ ...s, token: res.token, user: res.user, profile: res.profile, loading: false }));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await auth.register(email, password, fullName);
    setToken(res.token);
    setState((s) => ({ ...s, token: res.token, user: res.user, profile: res.profile, loading: false }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({ user: null, profile: null, token: null, loading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
