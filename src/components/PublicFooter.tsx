/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Share2, 
  Users as UsersIcon, 
  Star as StarIcon, 
  MapPin, 
  Phone, 
  Mail,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/AppLogo';
import { useBranding } from '@/context/BrandingContext';

interface PublicFooterProps {
  showWaveTransition?: boolean;
}

export default function PublicFooter({ showWaveTransition = true }: PublicFooterProps) {
  const { branding } = useBranding();
  return (
    <div className="relative mt-auto">
      {/* 3-Layer Organic Curved Separation Wave Transitioning INTO the Footer */}
      {showWaveTransition && (
        <div className="relative w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none bg-white -mb-[1px]">
          {/* Wave 1: Lueur Bleu Ciel Lumineux */}
          <svg
            viewBox="0 0 1440 120"
            className="relative block w-full h-14 sm:h-20 md:h-28 lg:h-36 text-sky-300/50 fill-current translate-y-[8px]"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C360,130 720,10 1080,80 C1260,115 1380,70 1440,50 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 2: Vague Éclatante Bleu Vibrant */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-14 sm:h-20 md:h-28 lg:h-36 text-blue-400/60 fill-current translate-y-[4px]"
            preserveAspectRatio="none"
          >
            <path d="M0,70 C380,140 700,20 1060,95 C1240,125 1360,85 1440,55 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 3: Main Foreground Solid Layer matching the slate-950 background of the footer */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-14 sm:h-20 md:h-28 lg:h-36 text-slate-950 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
          </svg>
        </div>
      )}

      {/* Main Footer Container - Grand Format Écran PC max-w-7xl */}
      <footer id="contact" className="bg-slate-950 pt-16 lg:pt-20 pb-10 text-white">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center">
                <AppLogo size="lg" variant="compact" />
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                {branding.institutionFullName || "Institut & Centre de Formation Professionnelle aux Métiers des Technologies et du Management"} agréé par le MINEFOP à {branding.city || "Douala - Logpom"}, Cameroun. 39 Spécialités d'excellence sanctionnées par le Diplôme de Qualification Professionnelle (DQP).
              </p>
              <div className="flex gap-2.5 pt-1">
                {[Globe, Share2, UsersIcon, StarIcon].map((Icon, i) => (
                  <Button key={i} variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-5">Navigation du Site</h4>
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <Link to="/" className="hover:text-blue-400 transition-colors">Accueil</Link>
                <Link to="/a-propos" className="hover:text-blue-400 transition-colors">À propos du Centre</Link>
                <Link to="/formations" className="hover:text-blue-400 transition-colors">39 Spécialités DQP</Link>
                <Link to="/actualites" className="hover:text-blue-400 transition-colors text-blue-400 font-bold">Nos Actualités &amp; Sessions</Link>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact &amp; Accès Campus</Link>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors text-slate-500">Portail Administration</Link>
              </div>
            </div>

            {/* Contact & Newsletter Column */}
            <div className="md:col-span-4 space-y-6">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-4">Campus {branding.city || "Douala - Logpom"}</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{branding.neighborhood || "Logpom, Carrefour Bassong"} ({branding.city || "Douala"})</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{branding.phone || "683 66 32 22 / 688 05 20 94"}</span>
                  </li>
                  <li className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <a 
                        href={`mailto:${branding.email || "info@cfp.itmc.com"}`} 
                        className="hover:text-blue-400 transition-colors"
                      >
                        {branding.email || "info@cfp.itmc.com"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5 pl-6.5">
                      <a 
                        href={`mailto:${branding.secondaryEmail || "cfp.itmc@gmail.com"}`} 
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        {branding.secondaryEmail || "cfp.itmc@gmail.com"}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-3">Lettre d'Information</h4>
                <div className="flex items-center bg-slate-900 rounded-2xl overflow-hidden p-1.5 border border-slate-800 focus-within:border-blue-600/50 transition-all">
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="bg-transparent border-none pl-3 pr-2 py-2 text-xs text-white placeholder-slate-500 outline-none flex-1 min-w-0"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 rounded-xl font-bold shrink-0 cursor-pointer transition-colors">
                    S'abonner
                  </Button>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
            <p>© 2026 {branding.institutionName || "CFP-ITMC"} ({branding.domain || "cfp-itmc.com"}). Tous droits réservés.</p>
            <p className="mt-2 sm:mt-0 text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Diplômes Homologués MINEFOP • {branding.neighborhood || "Logpom Carrefour Bassong"}, {branding.city || "Douala"}, Cameroun
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
