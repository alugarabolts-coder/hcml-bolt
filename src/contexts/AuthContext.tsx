import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthService, AuthUser, ActivityTracker } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: string | null; // Tambahkan ini
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Initialize on mount
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const session = AuthService.getCurrentSession();
        if (session) {
          setUser(session.user);
          setUserRole(session.user.role ?? null); // atau ambil dari groups
        }
        
        // Initialize activity tracker
        ActivityTracker.init();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      ActivityTracker.destroy();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await AuthService.login(username, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setUserRole(result.user.role ?? null); // atau ambil dari groups
        return true;
      } else {
        console.error('Login failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, userRole }}>
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