/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface BottomCallToActionBannerProps {
  title: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  primaryButtonOnClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonHref?: string;
  secondaryButtonIcon?: React.ReactNode;
}

export default function BottomCallToActionBanner({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  primaryButtonOnClick,
  secondaryButtonText,
  secondaryButtonLink,
  secondaryButtonHref,
  secondaryButtonIcon
}: BottomCallToActionBannerProps) {
  return (
    <section className="relative w-full bg-[#1e40af] text-white pt-24 sm:pt-32 md:pt-36 pb-36 sm:pb-48 md:pb-56 overflow-hidden">
      {/* Séparation ondulée en haut pour séparer le contenu clair du fond bleu */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none rotate-180">
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-12 sm:h-18 md:h-24 text-slate-50 fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 sm:px-8 max-w-5xl text-center relative z-10 space-y-8">
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mx-auto"
        >
          {title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          {description}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-4 pt-4"
        >
          {primaryButtonText && (
            primaryButtonLink ? (
              <a 
                href={primaryButtonLink}
                className="bg-white hover:bg-slate-100 text-blue-900 font-black rounded-full px-8 sm:px-10 h-14 sm:h-16 flex items-center justify-center text-sm sm:text-base shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {primaryButtonText}
              </a>
            ) : (
              <button 
                onClick={primaryButtonOnClick}
                className="bg-white hover:bg-slate-100 text-blue-900 font-black rounded-full px-8 sm:px-10 h-14 sm:h-16 flex items-center justify-center text-sm sm:text-base shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {primaryButtonText}
              </button>
            )
          )}

          {secondaryButtonText && (
            secondaryButtonHref ? (
              <a 
                href={secondaryButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white hover:bg-white/15 text-white font-bold rounded-full px-8 sm:px-10 h-14 sm:h-16 flex items-center justify-center text-sm sm:text-base transition-all gap-2 cursor-pointer bg-transparent"
              >
                {secondaryButtonIcon}
                {secondaryButtonText}
              </a>
            ) : secondaryButtonLink ? (
              <a 
                href={secondaryButtonLink}
                className="border-2 border-white hover:bg-white/15 text-white font-bold rounded-full px-8 sm:px-10 h-14 sm:h-16 flex items-center justify-center text-sm sm:text-base transition-all gap-2 cursor-pointer bg-transparent"
              >
                {secondaryButtonIcon}
                {secondaryButtonText}
              </a>
            ) : null
          )}
        </motion.div>
      </div>

      {/* 
        Magnifique Séparation Organique en Vagues (3 couches) 
        Transition directe et lumineuse vers le fond noir/ardoise (slate-950) du footer
      */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none">
        {/* Wave 1: Lueur Bleu Ciel Lumineux */}
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-16 sm:h-24 md:h-32 text-sky-300/50 fill-current translate-y-[6px]"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C360,130 720,10 1080,80 C1260,115 1380,70 1440,50 L1440,120 L0,120 Z" />
        </svg>
        
        {/* Wave 2: Vague Éclatante Bleu Vibrant */}
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 left-0 w-full h-16 sm:h-24 md:h-32 text-blue-300/70 fill-current translate-y-[3px]"
          preserveAspectRatio="none"
        >
          <path d="M0,70 C380,140 700,20 1060,95 C1240,125 1360,85 1440,55 L1440,120 L0,120 Z" />
        </svg>
        
        {/* Wave 3: Couche Principale Opaque Sombre (slate-950) pour le Footer */}
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 left-0 w-full h-16 sm:h-24 md:h-32 text-slate-950 fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
