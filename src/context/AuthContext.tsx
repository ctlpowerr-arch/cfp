import React, { createContext, useContext, useState, useEffect } from 'react';
import { encryptAndSignPayload, verifyAndDecryptPayload, sanitizeObject } from '@/lib/security';

export type UserRole = 'admin' | 'teacher' | 'student' | 'secretary';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  loginTime: number;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: UserSession) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  securityMessage: string | null;
  setSecurityMessage: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SECURE_STORAGE_KEY = 'ITMC_PORTAL_ENCRYPTED_SESSION';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Restore and verify encrypted session on initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken =
          sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
          sessionStorage.getItem(SECURE_STORAGE_KEY) ||
          localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
          localStorage.getItem(SECURE_STORAGE_KEY);

        if (storedToken) {
          // Attempt server validation first
          try {
            const res = await fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });
            if (res.ok) {
              const resData = await res.json();
              if (resData.success && resData.user) {
                const userObj: UserSession = {
                  id: resData.user.id,
                  name: resData.user.name,
                  email: resData.user.email,
                  role: resData.user.role,
                  permissions: resData.user.permissions,
                  avatar: resData.user.avatar,
                  loginTime: Date.now(),
                };
                setUser(userObj);
                setToken(storedToken);
                sessionStorage.setItem('ITMC_PORTAL_SESSION_TOKEN', storedToken);
                sessionStorage.setItem(SECURE_STORAGE_KEY, storedToken);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            // Server might be offline or initializing, proceed to offline check
          }

          // Fallback verification
          const verification = await verifyAndDecryptPayload<UserSession>(storedToken);
          if (verification.valid && verification.data) {
            setUser(sanitizeObject(verification.data));
            setToken(storedToken);
          } else {
            console.warn("Session d'authentification invalide ou altérée :", verification.error);
            sessionStorage.removeItem(SECURE_STORAGE_KEY);
            sessionStorage.removeItem('ITMC_PORTAL_SESSION_TOKEN');
            localStorage.removeItem(SECURE_STORAGE_KEY);
            localStorage.removeItem('ITMC_PORTAL_SESSION_TOKEN');
            setSecurityMessage("Session expirée ou altérée par sécurité.");
          }
        }
      } catch (err) {
        console.error("Erreur de restauration de la session sécurisée", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (userData: UserSession): Promise<boolean> => {
    try {
      const sanitizedUser = sanitizeObject({
        ...userData,
        loginTime: Date.now(),
      });

      // Call backend to obtain server-signed cryptographic token
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: sanitizedUser.email,
            role: sanitizedUser.role,
            id: sanitizedUser.id,
            name: sanitizedUser.name,
          }),
        });

        if (response.ok) {
          const authData = await response.json();
          if (authData.success && authData.token) {
            const serverUser: UserSession = {
              ...sanitizedUser,
              id: authData.user.id,
              role: authData.user.role,
              name: authData.user.name,
              email: authData.user.email,
              permissions: authData.user.permissions || sanitizedUser.permissions,
            };
            setUser(serverUser);
            setToken(authData.token);
            sessionStorage.setItem('ITMC_PORTAL_SESSION_TOKEN', authData.token);
            sessionStorage.setItem(SECURE_STORAGE_KEY, authData.token);
            localStorage.setItem('ITMC_PORTAL_SESSION_TOKEN', authData.token);
            localStorage.setItem(SECURE_STORAGE_KEY, authData.token);
            localStorage.setItem('teacherData', JSON.stringify(serverUser));
            localStorage.setItem('userRole', serverUser.role);
            setSecurityMessage(null);
            return true;
          }
        }
      } catch (netErr) {
        console.warn("Connexion réseau au serveur auth échouée, basculement sécurisé", netErr);
      }

      // Fallback signing if server unreachable
      const encryptedToken = await encryptAndSignPayload(sanitizedUser);
      setUser(sanitizedUser);
      setToken(encryptedToken);
      sessionStorage.setItem(SECURE_STORAGE_KEY, encryptedToken);
      sessionStorage.setItem('ITMC_PORTAL_SESSION_TOKEN', encryptedToken);
      setSecurityMessage(null);
      return true;
    } catch (err) {
      console.error("Échec de l'authentification sécurisée", err);
      return false;
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(SECURE_STORAGE_KEY);
    sessionStorage.removeItem('ITMC_PORTAL_SESSION_TOKEN');
    localStorage.removeItem(SECURE_STORAGE_KEY);
    localStorage.removeItem('ITMC_PORTAL_SESSION_TOKEN');
    localStorage.removeItem('teacherData');
    localStorage.removeItem('userRole');
    setSecurityMessage("Déconnexion sécurisée effectuée.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        token,
        login,
        logout,
        isLoading,
        securityMessage,
        setSecurityMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
