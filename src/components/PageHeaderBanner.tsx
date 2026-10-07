/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderBannerProps {
  title: string;
  description: string;
}

export default function PageHeaderBanner({
  title,
  description
}: PageHeaderBannerProps) {
  return (
    <div className="relative w-full bg-[#1e40af] text-white overflow-hidden">
      {/* Container Principal Centré - Très grand et spacieux, bleu uni et blanc pur */}
      <div className="container mx-auto px-6 sm:px-8 max-w-5xl text-center pt-36 sm:pt-44 md:pt-48 pb-32 sm:pb-40 md:pb-48 space-y-6 relative z-10">
        {/* Grand Titre Blanc Pur */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] drop-shadow-sm"
        >
          {title}
        </motion.h1>

        {/* Description / Sous-titre en Blanc */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          {description}
        </motion.p>
      </div>

      {/* 
        Magnifique Séparation Organique en Vagues (3 couches) 
        Fait la jonction parfaite entre la bannière bleue (#1e40af) et le fond du contenu (slate-50 / blanc)
      */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none">
        {/* Vague 1: Lueur Bleu Ciel Lumineux */}
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-16 sm:h-24 md:h-32 text-sky-300/50 fill-current translate-y-[6px]"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C360,130 720,10 1080,80 C1260,115 1380,70 1440,50 L1440,120 L0,120 Z" />
        </svg>
        
        {/* Vague 2: Vague Éclatante Bleu Vibrant */}
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 left-0 w-full h-16 sm:h-24 md:h-32 text-blue-300/70 fill-current translate-y-[3px]"
          preserveAspectRatio="none"
        >
          <path d="M0,70 C380,140 700,20 1060,95 C1240,125 1360,85 1440,55 L1440,120 L0,120 Z" />
        </svg>
        
        {/* Vague 3: Couche principale opaque parfaitement raccordée au fond de la page */}
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 left-0 w-full h-16 sm:h-24 md:h-32 text-slate-50 fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
}
