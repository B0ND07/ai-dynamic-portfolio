import { createContext, useContext, useEffect, useState } from 'react';
import { authService, getToken } from '@/lib/api';

interface User {
  username: string;
  email: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (username: string, email: string, password: string, password2: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and load user profile
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser({
            username: profile.username,
            email: profile.email || profile.user_email,
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      await authService.login(username, password);
      const profile = await authService.getProfile();
      setUser({
        username: profile.username,
        email: profile.email || profile.user_email,
      });
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signUp = async (username: string, email: string, password: string, password2: string) => {
    try {
      await authService.register(username, email, password, password2);
      const profile = await authService.getProfile();
      setUser({
        username: profile.username,
        email: profile.email || profile.user_email,
      });
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
