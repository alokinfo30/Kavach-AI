import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';

export interface User {
  id: number | string;
  username: string;
  email: string;
  role?: string;
  company?: string;
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (tokenOrEmail: string, password?: string) => Promise<void> | void;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  isLoading: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/user/me');
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // If token is invalid
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      try {
        const decoded: any = jwtDecode(currentToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          fetchUser();
        }
      } catch (error) {
        // Fallback: try fetching user anyway in case token is mock
        fetchUser();
      }
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (tokenOrEmail: string, password?: string) => {
    if (password !== undefined) {
      // Called with email and password
      const response = await api.post('/auth/login', { username: tokenOrEmail, password });
      const receivedToken = response.data.access_token || response.data.token;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        await fetchUser();
      }
    } else {
      // Called with token
      localStorage.setItem('token', tokenOrEmail);
      setToken(tokenOrEmail);
      await fetchUser();
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/register', { username: name || email.split('@')[0], email, password });
    const receivedToken = response.data.access_token || response.data.token || 'demo-token';
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    if (response.data.user) {
      setUser(response.data.user);
    } else {
      await fetchUser();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token || !!user,
      fetchUser,
      isLoading,
      loading: isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
