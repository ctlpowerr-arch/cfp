/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Cpu, 
  Briefcase, 
  CheckCircle2, 
  Users,
  Target,
  Sparkles,
  BookOpen,
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import BottomCallToActionBanner from '@/components/BottomCallToActionBanner';

export default function AboutPage() {
  const coreValues = [
    {
      icon: Award,
      title: "Diplômes d'État Homologués MINEFOP",
      desc: "Formations conduisant au Diplôme de Qualification Professionnelle (DQP) et Certificat (CQP) délivrés sous la tutelle directe du MINEFOP Cameroun.",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      icon: Cpu,
      title: "80% de Pratique en Laboratoires & Ateliers",
      desc: "Infrastructures informatiques haut débit, ateliers de diagnostic automobile assisté par ordinateur et bancs d'essai solaires et énergies renouvelables.",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      icon: Briefcase,
      title: "Insertion Professionnelle & Stages Garantis",
      desc: "Réseau de plus de 50 entreprises partenaires à Douala et en zone CEMAC pour des stages d'immersion pratique et une intégration sur le marché.",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      icon: Users,
      title: "Corps Enseignant d'Experts Métier",
      desc: "Formateurs certifiés, ingénieurs et cadres d'entreprises en activité transmettant des compétences concrètes et adaptées aux réalités du marché.",
      color: "bg-amber-50 text-amber-600 border-amber-100"
    }
  ];

  const stats = [
    { value: "80%", label: "Pratique sur le Terrain", desc: "Laboratoires informatiques & ateliers de pointe" },
    { value: "39", label: "Spécialités Homologuées", desc: "Couvrant les secteurs porteurs de l'économie" },
    { value: "94%", label: "Taux d'Insertion", desc: "De nos lauréats en entreprise ou à leur compte" },
    { value: "2 500+", label: "Lauréats Certifiés", desc: "Évoluant au Cameroun et à l'international" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <PublicNavbar />

      {/* Grande Bannière Immersive Bleu Uni & Blanc */}
      <PageHeaderBanner
        title="À Propos du CFP-ITMC"
        description="L'Excellence Professionnelle & Technique à Douala Logpom. Formations pratiques DQP homologuées MINEFOP."
      />

      {/* Section Principale Pleine Largeur (max-w-7xl) */}
      <section className="py-20 lg:py-28 bg-white flex-1">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl space-y-24">
          
          {/* Key Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 lg:p-8 text-center space-y-2 shadow-xs hover:border-blue-300 transition-colors">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base font-black text-slate-900">
                  {stat.label}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Mission & Vision - Grand Format 2 Colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/50">
                Notre Philosophie &amp; Mission
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-tight">
                Former des compétences directement opérationnelles
              </h2>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Face à la mutation rapide des technologies et à la demande grandissante d'expertise concrète au Cameroun et en Afrique centrale, le CFP-ITMC offre une formation de pointe sanctionnée par le <strong>Diplôme de Qualification Professionnelle (DQP)</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-0.5">39 Spécialités DQP</strong>
                    <span className="text-slate-600">Numérique, Automobile, BTP, Énergie &amp; Gestion</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-0.5">Ateliers Spécialisés</strong>
                    <span className="text-slate-600">Laboratoires climatisés &amp; bancs de test modernes</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-0.5">Stages Garantis</strong>
                    <span className="text-slate-600">Immersion en entreprise et suivi d'insertion</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-slate-900 block mb-0.5">Double Session</strong>
                    <span className="text-slate-600">Cours du Jour (8h-14h) et Soir (16h-22h)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
                  IT
                </div>
                <div>
                  <h3 className="font-black text-white text-lg sm:text-xl">Campus Principal de Douala</h3>
                  <p className="text-xs sm:text-sm text-blue-400 font-bold">Logpom Carrefour Andem • Douala 5ème</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Situé dans une zone stratégique et parfaitement desservie de Douala, le campus offre un cadre d'études moderne, sécurisé et pensé pour l'apprentissage pratique.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Homologation :</span>
                  <span className="text-emerald-400 font-bold">Arrêté Ministériel MINEFOP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Modalités d'accès :</span>
                  <span className="text-white font-bold">Étude de dossier &amp; Entretien</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rentrée académique :</span>
                  <span className="text-blue-400 font-bold">Sessions en continu</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/formations" className="w-full block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-11 rounded-xl shadow-md">
                    Consulter nos 39 Formations
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Piliers Fondamentaux */}
          <div className="space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/50">
                Nos Engagements Pédagogiques
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950">
                Les Piliers de l'Enseignement au CFP-ITMC
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Un accompagnement structuré du premier jour de cours jusqu'à l'obtention de votre diplôme et votre embauche.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((v, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-7 space-y-4 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${v.color}`}>
                      <v.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">{v.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Garantie d'excellence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Grande Bannière Finale Bleu Uni & Blanc en fond direct vers le Footer */}
      <BottomCallToActionBanner 
        title="Construisez votre Avenir Professionnel dès Aujourd'hui"
        description="Rejoignez l'un de nos cycles de formation DQP à Douala Logpom. Inscriptions ouvertes et places limitées par atelier."
        primaryButtonText="Explorer les 39 Formations"
        primaryButtonLink="/formations"
        secondaryButtonText="Nous Contacter & Venir au Campus"
        secondaryButtonLink="/contact"
      />

      <PublicFooter showWaveTransition={false} />
    </div>
  );
}
