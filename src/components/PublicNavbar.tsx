/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X,
  GraduationCap,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/AppLogo';
import { useRegistrationModal } from '@/context/RegistrationModalContext';

interface PublicNavbarProps {
  onOpenRegistration?: () => void;
  showSpacer?: boolean;
}

export default function PublicNavbar({ onOpenRegistration, showSpacer = false }: PublicNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openRegistration } = useRegistrationModal();

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/a-propos" },
    { label: "Formations (35 DQP)", href: "/formations" },
    { label: "Actualités", href: "/actualites", badge: "Nouveau" },
    { label: "Contact & Accès", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigate = (href: string) => {
    setIsMobileMenuOpen(false);
    navigate(href);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleRegistrationClick = () => {
    setIsMobileMenuOpen(false);
    if (onOpenRegistration) {
      onOpenRegistration();
    } else {
      openRegistration();
    }
  };

  return (
    <>
      {/* Background Overlay when mobile menu is open to dismiss easily */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Navbar Uniforme sur toutes les pages */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl pointer-events-auto">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-2xl shadow-blue-500/5 rounded-full px-5 sm:px-8 py-2 sm:py-3 flex items-center justify-between"
        >
          {/* Logo Brand */}
          <Link 
            to="/" 
            onClick={() => handleNavigate('/')}
            className="flex items-center shrink-0 group transition-transform hover:scale-[1.02]"
          >
            <AppLogo size="md" variant="compact" showSubtitle />
          </Link>
          
          {/* Main Desktop Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className={cn(
                    "text-xs xl:text-sm font-bold transition-colors flex items-center gap-1.5",
                    active 
                      ? "text-blue-600 font-black" 
                      : "text-slate-600 hover:text-blue-600"
                  )}
                >
                  {link.href === '/actualites' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Inscription Action */}
            <Button 
              onClick={handleRegistrationClick}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 sm:px-6 font-black text-xs sm:text-sm h-9 sm:h-10 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 hidden sm:inline-block" />
              <span>S'inscrire</span>
            </Button>
            
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="lg:hidden text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full min-w-[44px] min-h-[44px] h-10 w-10 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute top-16 sm:top-20 left-0 right-0 bg-white/98 backdrop-blur-3xl border border-slate-200/90 shadow-2xl rounded-3xl p-5 sm:p-6 flex flex-col gap-4 z-50 mt-2"
            >
              {/* Menu Links */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Navigation du Site</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">CFP-ITMC</span>
                </div>

                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <button 
                      key={link.href}
                      type="button"
                      onClick={() => handleNavigate(link.href)}
                      className={cn(
                        "w-full text-left text-sm font-bold px-3.5 py-3 rounded-2xl flex items-center justify-between min-h-[48px] transition-colors cursor-pointer",
                        active ? "bg-blue-50 text-blue-600 font-black" : "text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.badge && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </span>
                      {active ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      ) : (
                        link.href === '/a-propos' ? <ShieldCheck className="w-4 h-4 text-slate-400" /> :
                        link.href === '/contact' ? <MapPin className="w-4 h-4 text-slate-400" /> :
                        null
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Inscription Action in Mobile Menu */}
              <div className="pt-2 border-t border-slate-100">
                <Button 
                  type="button"
                  onClick={handleRegistrationClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-black text-sm min-h-[48px] h-12 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>S'inscrire en ligne dès maintenant</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer so page content doesn't collide with the fixed navbar */}
      {showSpacer && <div className="h-20 sm:h-24" />}
    </>
  );
}
