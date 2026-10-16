/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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
      {/* Main Bottom Navigation Bar - Fixed & Non-Retractable / Normal */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}
      >
        <nav className="grid grid-cols-5 items-center justify-between max-w-lg mx-auto">
          {items.slice(0, 5).map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 select-none cursor-pointer",
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
                  "text-[10px] font-black tracking-tight mt-1 truncate max-w-[64px] text-center leading-none",
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
      </div>
    </div>
  );
}
