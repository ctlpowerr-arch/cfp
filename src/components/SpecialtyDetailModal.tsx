/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Wrench,
  SunMoon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpecialtyItem } from '@/data/specialtiesData';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import { useRegistrationModal } from '@/context/RegistrationModalContext';

interface SpecialtyDetailModalProps {
  specialty: SpecialtyItem | null;
  onClose: () => void;
}

export default function SpecialtyDetailModal({ specialty, onClose }: SpecialtyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { openRegistration } = useRegistrationModal();

  const handleRegister = () => {
    onClose();
    if (specialty?.id) {
      openRegistration(specialty.id);
    } else {
      openRegistration();
    }
  };

  // Reset active image index when specialty changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [specialty]);

  if (!specialty) return null;

  const images = specialty.images && specialty.images.length > 0 
    ? specialty.images 
    : ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop Dark Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Body Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col z-10 text-left my-auto"
        >
          
          {/* Modal Header avec Titre, Badges et Bouton Fermer */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-100/50 shrink-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-slate-900 text-white font-extrabold text-[10px] px-3 py-1 rounded-full tracking-wider uppercase">
                  {specialty.filiere}
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  {specialty.subCategory}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  80% Pratique
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
                {specialty.name}
              </h2>
            </div>
            
            {/* Top Close Button */}
            <button 
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-all cursor-pointer border border-slate-200/80 shrink-0 ml-3"
              title="Fermer la fiche"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-8 custom-scrollbar">
            
            {/* Intro Grid: Left Interactive Image Carousel & Right Key Bento Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left: Interactive Image Carousel */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative h-64 sm:h-80 md:h-96 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/60 shadow-md">
                  <img 
                    src={getOptimizedImageUrl(images[activeImageIndex] || images[0], { width: 800, quality: 80 })} 
                    alt={specialty.name} 
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=75';
                    }}
                  />
                  
                  {/* Carousel Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all cursor-pointer shadow-lg hover:scale-110"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all cursor-pointer shadow-lg hover:scale-110"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Image index badge overlay */}
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex gap-1.5 items-center">
                    Photo {activeImageIndex + 1} / {images.length}
                  </div>

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-1.5 items-center">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeImageIndex ? 'bg-blue-400 w-5' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Small Thumbnails Strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${idx === activeImageIndex ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img 
                          src={getOptimizedImageUrl(img, { width: 160, quality: 70 })} 
                          alt="" 
                          loading="lazy"
                          decoding="async"
                          width="80"
                          height="56"
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Key Info & Bento Grid */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/40">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">Présentation :</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                      "{specialty.description}"
                    </p>
                  </div>

                  {/* Bento grid of Key Practical Details */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 flex items-start gap-2.5">
                      <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Durée</span>
                        <p className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">12 Mois</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 flex items-start gap-2.5">
                      <Wrench className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Pédagogie</span>
                        <p className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">80% Pratique</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 flex items-start gap-2.5">
                      <SunMoon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Sessions</span>
                        <p className="text-xs font-black text-slate-800">Jour &amp; Soir</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/50 flex items-start gap-2.5">
                      <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Niveau Requis</span>
                        <p className="text-xs font-black text-slate-800 line-clamp-2" title={specialty.levelRequired}>
                          {specialty.levelRequired}
                        </p>
                      </div>
                    </div>

                    {/* Full width inside grid for tuition fee & certification */}
                    <div className="col-span-2 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50 flex items-start gap-3">
                      <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Frais de Formation (12 Mois)</span>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {specialty.tuitionFee || "Frais compétitifs avec facilités de paiement en plusieurs tranches."}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Diplôme &amp; Certification</span>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {specialty.certification || "Certificat / DQP homologué par le MINEFOP"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl h-14 gap-2.5 shadow-lg shadow-blue-500/20 cursor-pointer text-sm"
                  >
                    S'inscrire à cette formation (12 Mois)
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Button>
                </div>
              </div>

            </div>

            {/* Extended Details Grid: Skills, Careers, and Curriculum Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4 border-t border-slate-100">
              
              {/* Left Block: Competences Clés & Debouchés */}
              <div className="space-y-6">
                {specialty.skills && specialty.skills.length > 0 && (
                  <div className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/40 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Compétences clés acquises :
                    </h4>
                    <ul className="space-y-2.5">
                      {specialty.skills.map((skill, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {specialty.opportunities && specialty.opportunities.length > 0 && (
                  <div className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/40 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Débouchés professionnels au Cameroun &amp; International :
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {specialty.opportunities.map((opp, index) => (
                        <span 
                          key={index}
                          className="bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/70 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          💼 {opp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Block: Structured Curriculum Modules */}
              {specialty.modules && specialty.modules.length > 0 && (
                <div className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/40 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Modules intensifs du programme (12 Mois) :
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {specialty.modules.map((module, index) => (
                        <div 
                          key={index}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/50 flex gap-3.5 items-center hover:shadow-xs transition-shadow"
                        >
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">
                            M{index + 1}
                          </span>
                          <span className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed">
                            {module}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/50">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      * Ce programme de 12 Mois est structuré à <strong>80% de pratique en atelier</strong> et <strong>20% de concepts clés</strong>, disponible en <strong>Cours du Jour (08h30 - 13h30)</strong> et <strong>Cours du Soir (17h30 - 20h30)</strong>.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Full Width Long Description / Editorial presentation */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <h4 className="font-black text-sm md:text-base tracking-wide uppercase text-blue-400">
                Pédagogie 80% Pratique &amp; Insertion Professionnelle
              </h4>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                {specialty.longDescription || "Formation intensive orientée pratique métier avec travaux pratiques quotidiens sur équipements professionnels, complétée par un stage en entreprise pour une insertion rapide sur le marché de l'emploi."}
              </p>
            </div>

          </div>

          {/* Modal Footer avec Boutons Clairs (Inscrire + Fermer) */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
            <Button 
              variant="outline"
              onClick={onClose}
              className="rounded-2xl text-xs sm:text-sm h-11 px-6 border-slate-300 text-slate-700 hover:bg-slate-200 cursor-pointer font-bold gap-2"
            >
              <X className="w-4 h-4" />
              <span>Fermer la fiche</span>
            </Button>

            <Button 
              onClick={handleRegister}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-md cursor-pointer gap-2"
            >
              <span>S'inscrire à cette formation (12 Mois)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
