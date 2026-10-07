import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronDown, ChevronUp, Menu, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeColorClass?: string; // e.g. "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
}

export default function MobileBottomNav({ 
  items, 
  activeColorClass = "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50" 
}: MobileBottomNavProps) {
  const location = useLocation();
  const [isRetracted, setIsRetracted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itmc_mobile_nav_retracted') === 'true';
    } catch {
      return false;
    }
  });

  const toggleRetract = () => {
    setIsRetracted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('itmc_mobile_nav_retracted', String(next));
      } catch {}
      return next;
    });
  };

  const isItemActive = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href === '/dashboard' && location.pathname === '/dashboard') return true;
    if (href === '/teacher' && location.pathname === '/teacher') return true;
    if (href === '/student' && location.pathname === '/student') return true;
    
    if (href !== '/' && href !== '/dashboard' && href !== '/teacher' && href !== '/student') {
      return location.pathname.startsWith(href);
    }
    return false;
  };

  return (
    <div className="block lg:hidden">
      {/* Floating Expand Trigger when Navigation is Retracted */}
      <AnimatePresence>
        {isRetracted && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleRetract}
            title="Afficher la barre de navigation"
            aria-label="Déplier la navigation"
            className="fixed bottom-4 right-4 z-50 bg-slate-900/90 hover:bg-slate-900 text-white dark:bg-blue-600 dark:hover:bg-blue-700 p-2.5 px-3.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 cursor-pointer text-xs font-black tracking-wide select-none"
          >
            <Menu className="w-4 h-4 text-blue-400 dark:text-white animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase">Menu</span>
            <ChevronUp className="w-3.5 h-3.5 opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Bottom Navigation Bar with Retraction Control */}
      <AnimatePresence>
        {!isRetracted && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-1.5 pt-1 pb-safe"
          >
            {/* Quick Retract Button Tab */}
            <div className="flex items-center justify-center -mt-2.5 mb-0.5">
              <button
                onClick={toggleRetract}
                title="Rétracter la barre de navigation pour plus d'espace"
                aria-label="Rétracter la barre de navigation"
                className="group flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-200/90 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Rétracter</span>
                <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            <nav className="grid grid-cols-5 items-center justify-between max-w-lg mx-auto pb-1">
              {items.slice(0, 5).map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 select-none cursor-pointer",
                      active 
                        ? activeColorClass
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        active ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                      )} />
                      {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                        <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    <span className={cn(
                      "text-[10px] font-black tracking-tight mt-0.5 truncate max-w-[64px] text-center leading-none",
                      active ? "font-extrabold" : "font-semibold text-slate-500 dark:text-slate-400"
                    )}>
                      {item.label}
                    </span>

                    {active && (
                      <span className="absolute -bottom-0.5 w-4 h-1 rounded-full bg-current opacity-80" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
