import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("lifewithai_token");
  });

  // Immediately available user — set on login so ProtectedRoute doesn't flash-redirect
  const [localUser, setLocalUser] = useState<User | null>(null);

  const { data: meData, isLoading: isMeLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  // Set the token getter for the API client
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("lifewithai_token"));
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("lifewithai_token", newToken);
    setToken(newToken);
    setLocalUser(newUser); // Set immediately so ProtectedRoute doesn't redirect
  };

  const logout = () => {
    localStorage.removeItem("lifewithai_token");
    setToken(null);
    setLocalUser(null);
    window.location.href = "/auth/login";
  };

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  // meData (from /api/auth/me) is source of truth once loaded; fall back to localUser during transition
  const user = meData ?? localUser ?? null;
  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === "admin";
  // Only show loading spinner if we have a token but neither meData nor localUser yet
  const isLoading = !!token && !user && isMeLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
