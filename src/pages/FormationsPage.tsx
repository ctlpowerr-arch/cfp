/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  Award, 
  X,
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowRight,
  FileText,
  ImageIcon,
  CheckCircle2,
  Phone,
  MessageCircle,
  Briefcase,
  Wrench,
  SunMoon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import BottomCallToActionBanner from '@/components/BottomCallToActionBanner';
import SpecialtyDetailModal from '@/components/SpecialtyDetailModal';
import { defaultSpecialties, FILIERES, SpecialtyItem } from '@/data/specialtiesData';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';
import { useRegistrationModal } from '@/context/RegistrationModalContext';

export default function FormationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState<string>('all');
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyItem | null>(null);
  const { openRegistration } = useRegistrationModal();

  const filiereCategories = [
    { id: 'all', label: 'Toutes les Spécialités (35)', count: 35 },
    { id: FILIERES.BATIMENT.name, label: '🏗️ Bâtiment & Construction (11)', count: 11 },
    { id: FILIERES.INDUSTRIE.name, label: '⚙️ Industrie, Mécanique & Énergie (9)', count: 9 },
    { id: FILIERES.INFORMATIQUE.name, label: '💻 Informatique & Digital (8)', count: 8 },
    { id: FILIERES.ADMINISTRATION.name, label: '💼 Administration & Gestion (7)', count: 7 },
  ];

  const filtered = defaultSpecialties.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFiliere = selectedFiliere === 'all' || item.filiere.toLowerCase() === selectedFiliere.toLowerCase();

    return matchesSearch && matchesFiliere;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <PublicNavbar />

      {/* Grande Bannière Immersive Bleu Uni & Blanc */}
      <PageHeaderBanner
        title="Nos 35 Spécialités Professionnelles"
        description="Formations 100% professionnelles et pratiques (80% en atelier) • Sanctionnées par les diplômes d'État DQP (12 Mois), CQP et AQP sous tutelle MINEFOP • Cours du Jour & du Soir."
      />

      {/* Main Content - Pleine Largeur PC max-w-7xl */}
      <section className="py-12 lg:py-20 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
          
          {/* Controls Bar - Recherche & Filtres */}
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl shadow-slate-200/50">
            
            {/* Highlights Banner: 12 Mois • 80% Pratique • Cours du Jour & Soir */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-100 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-800">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-black">Durée : <strong>12 Mois</strong></span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-800">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <span className="text-xs sm:text-sm font-black">Pédagogie : <strong>80% Pratique</strong> en atelier</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-800">
                <SunMoon className="w-5 h-5 text-emerald-600" />
                <span className="text-xs sm:text-sm font-black">Horaires : <strong>Cours du Jour & Soir</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              {/* Search Bar */}
              <div className="lg:col-span-7 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une formation (Plomberie, Carrelage, Mécatronique, Infographie, Caissier...)"
                  className="w-full h-12 pl-12 pr-10 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:bg-white text-sm font-medium shadow-xs transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Compteur & Badge */}
              <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-3 text-xs sm:text-sm text-slate-600 font-bold">
                <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl border border-blue-100">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span><strong>{filtered.length}</strong> sur 35 spécialités</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl border border-emerald-100 hidden sm:inline">
                  Certificat DQP / CQP MINEFOP
                </span>
              </div>

            </div>

            {/* Filières Filter Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
              {filiereCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFiliere(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedFiliere.toLowerCase() === cat.id.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grille Magnifique de Cartes avec Photos & Fiche Pratique */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((spec) => {
              const mainImage = getOptimizedImageUrl(
                spec.images && spec.images.length > 0 ? spec.images[0] : null,
                { width: 600, quality: 75 }
              );

              return (
                <div
                  key={spec.id}
                  onClick={() => setActiveSpecialty(spec)}
                  className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Image d'en-tête avec Tags */}
                    <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={mainImage} 
                        alt={spec.name}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="360"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=75';
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Filiere Tag */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="bg-slate-950/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-md">
                          {spec.filiere.split(',')[0]}
                        </span>
                        <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          80% Pratique
                        </span>
                      </div>

                      {/* Sous-catégorie & Code Programme */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-[11px] font-extrabold text-blue-300 bg-blue-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-blue-400/30">
                          {spec.subCategory}
                        </span>
                        <span className="text-[10px] font-mono text-slate-300 font-bold">
                          PROG-{spec.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Contenu Texte */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {spec.name}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {spec.description}
                      </p>
                    </div>
                  </div>

                  {/* Fiche Technique & Bouton */}
                  <div className="p-6 pt-0 space-y-4">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs font-medium text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Durée :
                        </span>
                        <strong className="text-slate-950 font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">12 Mois</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <SunMoon className="w-3.5 h-3.5 text-indigo-600" />
                          Sessions :
                        </span>
                        <strong className="text-slate-950 font-bold">Jour &amp; Soir</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                          Niveau requis :
                        </span>
                        <strong className="text-slate-950 font-bold">{spec.levelRequired}</strong>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          Certification :
                        </span>
                        <span className="text-emerald-700 font-extrabold uppercase text-[10px] bg-emerald-100/70 px-2 py-0.5 rounded">
                          DQP / CQP MINEFOP
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm h-11 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn cursor-pointer shadow-md"
                    >
                      <FileText className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
                      <span>Consulter le Programme &amp; Détails</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-slate-200 text-slate-500 space-y-4 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-lg font-black text-slate-800">Aucune spécialité ne correspond à votre recherche.</p>
              <Button 
                onClick={() => { setSearchTerm(''); setSelectedFiliere('all'); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                Afficher toutes les 35 spécialités
              </Button>
            </div>
          )}

        </div>
      </section>

      {/* Grande Bannière Finale Bleu Uni & Blanc en fond direct vers le Footer */}
      <BottomCallToActionBanner 
        title="Prêt à Vous Inscrire pour la Prochaine Session de 12 Mois ?"
        description="Nos sessions démarrent chaque mois en cours du jour et cours du soir. 80% de pratique en atelier et immersion immédiate."
        primaryButtonText="S'inscrire en Ligne"
        primaryButtonOnClick={() => openRegistration()}
        secondaryButtonText="WhatsApp Direct (+237 638 36 63 22)"
        secondaryButtonHref="https://wa.me/237638366322"
        secondaryButtonIcon={<MessageCircle className="w-5 h-5 text-emerald-300" />}
      />

      {/* Modal Détails & Syllabus Complet */}
      <SpecialtyDetailModal 
        specialty={activeSpecialty} 
        onClose={() => setActiveSpecialty(null)} 
      />

      <PublicFooter showWaveTransition={false} />
    </div>
  );
}
