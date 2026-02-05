import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newEmail: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
    setToken(newToken);
    setEmail(newEmail);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
