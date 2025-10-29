import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  phone: string;
  isAuthenticated: boolean;
  loginTime?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userPhone = localStorage.getItem('userPhone');
        const loginTime = localStorage.getItem('loginTime');

        if (isAuthenticated && userPhone) {
          // Check if login is still valid (24 hours)
          const loginTimestamp = loginTime ? new Date(loginTime) : new Date();
          const currentTime = new Date();
          const timeDiff = currentTime.getTime() - loginTimestamp.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);

          if (hoursDiff < 24) {
            setUser({
              phone: userPhone,
              isAuthenticated: true,
              loginTime: loginTime || undefined,
            });
          } else {
            // Session expired, clear storage
            logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (phone: string) => {
    const loginTime = new Date().toISOString();
    const newUser: User = {
      phone,
      isAuthenticated: true,
      loginTime,
    };

    setUser(newUser);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('loginTime', loginTime);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberedPhone');
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook to check if user is authenticated
export const useRequireAuth = () => {
  const { user, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !user?.isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [user, isLoading]);

  return { isAuthenticated: user?.isAuthenticated || false, shouldRedirect, isLoading };
};
