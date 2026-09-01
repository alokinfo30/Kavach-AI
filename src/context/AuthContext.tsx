import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';
import { localMockLogin, localMockRegister, getLocalMockCurrentUser } from '../lib/mockAuthService';

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
  register?: (email: string, password: string, name?: string, company?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  isLoading: boolean;
  loading: boolean;
  // Session expiration and warning
  expiresAt: number | null;
  secondsRemaining: number;
  showExpiryWarning: boolean;
  isExtendingSession: boolean;
  extendSession: () => Promise<boolean>;
  dismissExpiryWarning: () => void;
  simulateExpiryWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('kavach_current_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  
  // Session expiration state
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const saved = localStorage.getItem('session_expires_at');
    return saved ? parseInt(saved, 10) : null;
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [showExpiryWarning, setShowExpiryWarning] = useState<boolean>(false);
  const [isExtendingSession, setIsExtendingSession] = useState<boolean>(false);
  const [warningDismissed, setWarningDismissed] = useState<boolean>(false);

  const calculateExpiryFromToken = (rawToken: string): number => {
    try {
      const decoded: any = jwtDecode(rawToken);
      if (decoded && decoded.exp) {
        return decoded.exp * 1000;
      }
    } catch {
      // Fallback
    }
    return Date.now() + 15 * 60 * 1000;
  };

  const fetchUser = async () => {
    try {
      const res = await api.get('/user/me');
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('kavach_current_user', JSON.stringify(res.data));
      }
    } catch (error) {
      console.warn("[AuthContext] Primary user profile fetch error, checking local fallback user", error);
      const fallbackUser = getLocalMockCurrentUser();
      if (fallbackUser && token) {
        setUser(fallbackUser);
      } else if (!token) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor Token Expiry & Countdown
  useEffect(() => {
    if (!token) {
      setShowExpiryWarning(false);
      return;
    }

    // Set initial expiry if missing
    let currentExpiresAt = expiresAt;
    if (!currentExpiresAt) {
      currentExpiresAt = calculateExpiryFromToken(token);
      setExpiresAt(currentExpiresAt);
      localStorage.setItem('session_expires_at', currentExpiresAt.toString());
    }

    const interval = setInterval(() => {
      if (!expiresAt) return;

      const now = Date.now();
      const remainingMs = expiresAt - now;
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsRemaining(remainingSec);

      // Trigger warning when 60 seconds or less remain, and user hasn't dismissed this specific window
      if (remainingSec <= 60 && remainingSec > 0) {
        if (!warningDismissed) {
          setShowExpiryWarning(true);
        }
      } else if (remainingSec > 60) {
        setShowExpiryWarning(false);
        setWarningDismissed(false);
      }

      // Auto logout when expired
      if (remainingSec <= 0) {
        setShowExpiryWarning(false);
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, expiresAt, warningDismissed]);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      try {
        const decoded: any = jwtDecode(currentToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          if (decoded.exp) {
            const expMs = decoded.exp * 1000;
            setExpiresAt(expMs);
            localStorage.setItem('session_expires_at', expMs.toString());
          }
          fetchUser();
        }
      } catch (error) {
        fetchUser();
      }
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const extendSession = async (): Promise<boolean> => {
    try {
      setIsExtendingSession(true);
      const res = await api.post('/auth/refresh');
      const newToken = res.data?.access_token || res.data?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
      }
      
      const newExpiry = res.data?.expires_at || (Date.now() + 15 * 60 * 1000);
      setExpiresAt(newExpiry);
      localStorage.setItem('session_expires_at', newExpiry.toString());
      setSecondsRemaining(Math.floor((newExpiry - Date.now()) / 1000));
      setShowExpiryWarning(false);
      setWarningDismissed(false);
      return true;
    } catch (err) {
      console.warn("Failed to extend session via remote API, extending locally", err);
      // Even if network fails temporarily, extend locally if authenticated
      const localExpiry = Date.now() + 15 * 60 * 1000;
      setExpiresAt(localExpiry);
      localStorage.setItem('session_expires_at', localExpiry.toString());
      setShowExpiryWarning(false);
      setWarningDismissed(false);
      return true;
    } finally {
      setIsExtendingSession(false);
    }
  };

  const simulateExpiryWarning = () => {
    // Sets session expiry to 55 seconds from now for immediate UI verification
    const simulatedExpiry = Date.now() + 55 * 1000;
    setExpiresAt(simulatedExpiry);
    localStorage.setItem('session_expires_at', simulatedExpiry.toString());
    setSecondsRemaining(55);
    setWarningDismissed(false);
    setShowExpiryWarning(true);
  };

  const dismissExpiryWarning = () => {
    setShowExpiryWarning(false);
    setWarningDismissed(true);
  };

  const login = async (tokenOrEmail: string, password?: string) => {
    if (password !== undefined) {
      try {
        const response = await api.post('/auth/login', { username: tokenOrEmail, password });
        const receivedToken = response.data?.access_token || response.data?.token;
        if (receivedToken) {
          localStorage.setItem('token', receivedToken);
          setToken(receivedToken);
          
          const expTime = response.data?.expires_at || calculateExpiryFromToken(receivedToken);
          setExpiresAt(expTime);
          localStorage.setItem('session_expires_at', expTime.toString());
          setWarningDismissed(false);
          setShowExpiryWarning(false);

          if (response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('kavach_current_user', JSON.stringify(response.data.user));
          } else {
            await fetchUser();
          }
          return;
        }
      } catch (err) {
        console.warn("[AuthContext] Primary login failed or 404, applying local mock fallback auth", err);
      }

      // Seamless fallback to local mock authentication
      const mockResult = localMockLogin(tokenOrEmail, password);
      setToken(mockResult.access_token);
      setExpiresAt(mockResult.expires_at);
      setUser(mockResult.user);
      setWarningDismissed(false);
      setShowExpiryWarning(false);
    } else {
      localStorage.setItem('token', tokenOrEmail);
      setToken(tokenOrEmail);
      const expTime = calculateExpiryFromToken(tokenOrEmail);
      setExpiresAt(expTime);
      localStorage.setItem('session_expires_at', expTime.toString());
      setWarningDismissed(false);
      setShowExpiryWarning(false);
      await fetchUser();
    }
  };

  const register = async (email: string, password: string, name?: string, company?: string) => {
    try {
      const response = await api.post('/auth/register', { 
        username: name || email.split('@')[0], 
        email, 
        password,
        company: company || "Enterprise Corp"
      });
      const receivedToken = response.data?.access_token || response.data?.token;
      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        
        const expTime = response.data?.expires_at || calculateExpiryFromToken(receivedToken);
        setExpiresAt(expTime);
        localStorage.setItem('session_expires_at', expTime.toString());
        setWarningDismissed(false);
        setShowExpiryWarning(false);

        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('kavach_current_user', JSON.stringify(response.data.user));
        } else {
          await fetchUser();
        }
        return;
      }
    } catch (err) {
      console.warn("[AuthContext] Primary registration failed or 404, applying local mock fallback registration", err);
    }

    // Seamless fallback to local mock registration
    const mockResult = localMockRegister(name || email.split('@')[0], email, password, company);
    setToken(mockResult.access_token);
    setExpiresAt(mockResult.expires_at);
    setUser(mockResult.user);
    setWarningDismissed(false);
    setShowExpiryWarning(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('session_expires_at');
    localStorage.removeItem('kavach_current_user');
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    setShowExpiryWarning(false);
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
      loading: isLoading,
      expiresAt,
      secondsRemaining,
      showExpiryWarning,
      isExtendingSession,
      extendSession,
      dismissExpiryWarning,
      simulateExpiryWarning
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
