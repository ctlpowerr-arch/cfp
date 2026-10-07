import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLightMode: () => void;
  setDarkMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('itmc_admin_theme');
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {}
  // Default to light mode for standard administration view
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Directly calculate isDark to eliminate render lag or desync
  const isDark = theme === 'dark' || (theme === 'system' && (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const applyThemeToDom = (dark: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const currentPath = window.location.pathname;
    
    // Protect public vitrine to remain clean and bright
    const isPublicVitrine = currentPath === '/' || 
      currentPath.startsWith('/a-propos') || 
      currentPath.startsWith('/formations') || 
      currentPath.startsWith('/actualites') || 
      currentPath.startsWith('/contact');

    if (isPublicVitrine) {
      root.classList.remove('dark');
      return;
    }

    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    applyThemeToDom(isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyThemeToDom(mediaQuery.matches);
      }
    };

    const handlePopState = () => {
      applyThemeToDom(isDark);
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [theme, isDark]);

  const setTheme = (newTheme: Theme, showToast = true) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('itmc_admin_theme', newTheme);
    } catch {}

    const willBeDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyThemeToDom(willBeDark);

    if (showToast) {
      if (newTheme === 'light') {
        toast.success("☀️ Mode Clair activé", { duration: 2000 });
      } else if (newTheme === 'dark') {
        toast.success("🌙 Mode Sombre activé", { duration: 2000 });
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    setTheme(nextTheme, true);
  };

  const setLightMode = () => setTheme('light', true);
  const setDarkMode = () => setTheme('dark', true);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, setLightMode, setDarkMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
