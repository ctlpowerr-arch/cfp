/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Espace & Portail du Personnel Administratif
 * CFP-ITMC Douala
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Wallet,
  Calendar,
  FileText,
  UserSquare2,
  GraduationCap,
  Globe,
  Gamepad2,
  Lock,
  ArrowRight,
  Activity,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  Search,
  Bell,
  Sliders,
  LogOut,
  Building,
  KeyRound
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { 
  ALL_PERMISSIONS, 
  ADMINISTRATIVE_ROLES, 
  getRoleMeta, 
  hasPermission,
  PERMISSION_CATEGORIES 
} from '@/data/administrativeRolesData';

export default function StaffPortalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/overview-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Error fetching overview stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const userPerms = Array.isArray(user?.permissions) ? user.permissions : [];
  const roleMeta = getRoleMeta((user as any)?.roleCode || 'rh');

  // Available Modules mapped to permissions
  const administrativeModules = [
    {
      id: 'students',
      title: 'Gestion des Étudiants & Scolarité',
      description: 'Consultation des promotions, dossiers numériques, édition des fiches et matricules MINEFOP.',
      icon: GraduationCap,
      href: '/dashboard/students',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Scolarité',
      requiredPerm: 'perm_view_students_list'
    },
    {
      id: 'registrations',
      title: 'Candidatures & Pré-Inscriptions',
      description: 'Traitement des dossiers d\'admission, validation des pièces et intégration aux effectifs.',
      icon: FileText,
      href: '/dashboard/registrations',
      color: 'from-amber-500 to-orange-600',
      badge: 'Admissions',
      requiredPerm: 'perm_view_registrations'
    },
    {
      id: 'caisse',
      title: 'Caisse, Trésorerie & Finances',
      description: 'Encaissement des frais de scolarité, délivrance des reçus et bilans financiers.',
      icon: Wallet,
      href: '/dashboard/caisse',
      color: 'from-emerald-600 to-teal-700',
      badge: 'Finances',
      requiredPerm: 'perm_view_caisse'
    },
    {
      id: 'teachers',
      title: 'Corps Enseignant & Formateurs',
      description: 'Répertoire des formateurs, attributions des modules DQP et suivi des vacations.',
      icon: UserSquare2,
      href: '/dashboard/teachers',
      color: 'from-purple-600 to-indigo-700',
      badge: 'Pédagogie',
      requiredPerm: 'perm_view_teachers'
    },
    {
      id: 'schedule',
      title: 'Emplois du Temps & Salles',
      description: 'Grille horaire hebdomadaire, détection anti-collision et affectation des salles/labos.',
      icon: Calendar,
      href: '/dashboard/schedule',
      color: 'from-cyan-600 to-blue-700',
      badge: 'Horaires',
      requiredPerm: 'perm_view_schedules'
    },
    {
      id: 'classes',
      title: 'Gestion des Classes & Filières',
      description: 'Organisation des 35 filières professionnelles, promotions et effectifs de formation.',
      icon: Layers,
      href: '/dashboard/classes',
      color: 'from-rose-600 to-pink-700',
      badge: 'Filières',
      requiredPerm: 'perm_view_students_list'
    },
    {
      id: 'news',
      title: 'Site Vitrine & Publications',
      description: 'Rédaction des actualités publiques, agenda des portes ouvertes et bannières du campus.',
      icon: Globe,
      href: '/dashboard/news',
      color: 'from-pink-600 to-rose-600',
      badge: 'Communication',
      requiredPerm: 'perm_post_news_vitrine'
    },
    {
      id: 'games',
      title: 'Jeux Éducatifs & Compétition TV',
      description: 'Animation de tournois interactifs, buzzer multijoueur et quiz chrono en direct.',
      icon: Gamepad2,
      href: '/dashboard/games',
      color: 'from-violet-600 to-purple-800',
      badge: 'E-Learning',
      requiredPerm: 'perm_view_games'
    },
    {
      id: 'staff_mgmt',
      title: 'Personnel Administratif & RBAC',
      description: 'Administration des comptes du personnel, 14 rôles et matrice des 50 permissions.',
      icon: ShieldCheck,
      href: '/dashboard/staff',
      color: 'from-slate-800 to-slate-950',
      badge: 'Super Admin',
      requiredPerm: 'perm_manage_staff'
    }
  ];

  // Filter modules user is authorized to access
  const authorizedModules = administrativeModules.filter(
    (mod) => hasPermission(user, mod.requiredPerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            ITMC
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
              CFP-ITMC • Espace Personnel Administratif
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Plateforme Sécurisée de Gestion Académique</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || "Collaborateur"}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{roleMeta.shortTitle}</span>
          </div>

          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Staff')}`} />
            <AvatarFallback>{user?.name?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className={cn("px-3 py-1 font-bold text-xs uppercase border-none", roleMeta.badgeColor)}>
                  {roleMeta.title}
                </Badge>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/40 bg-emerald-500/10 font-mono text-[10px]">
                  ● Session Sécurisée RBAC
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Bonjour, {user?.name || "Membre de l'Administration"}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Bienvenue dans votre espace de travail administratif. Vos outils et autorisations d'action sont strictement configurés selon vos {userPerms.length} permissions attribuées.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center shrink-0 min-w-44">
              <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Vos Droits d'Accès</span>
              <span className="text-3xl font-black text-emerald-400 my-1">{userPerms.length} / 50</span>
              <span className="text-[10px] text-slate-300">Permissions Actives</span>
            </div>
          </div>
        </div>

        {/* Quick System Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-3xl border-none shadow-sm bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-5">
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Effectif Étudiants</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalStudents || 0}</p>
                <span className="text-[10px] text-slate-500">Inscrits officiellement</span>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-amber-50 dark:bg-amber-950/30">
              <CardContent className="p-5">
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Candidatures</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.pendingRegistrations || 0}</p>
                <span className="text-[10px] text-slate-500">En attente de validation</span>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-purple-50 dark:bg-purple-950/30">
              <CardContent className="p-5">
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Corps Enseignant</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalTeachers || 0}</p>
                <span className="text-[10px] text-slate-500">Formateurs actifs</span>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/30">
              <CardContent className="p-5">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Filières &amp; Classes</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalClasses || 0}</p>
                <span className="text-[10px] text-slate-500">Promotions ouvertes</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Authorized Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Modules &amp; Outils de Gestion Autorisés</span>
              </h2>
              <p className="text-xs text-slate-500">Accédez directement aux fonctionnalités débloquées par votre profil.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizedModules.map((mod) => (
              <Card
                key={mod.id}
                className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-linear-to-br", mod.color)}>
                      <mod.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase">
                      {mod.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Accès accordé
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate(mod.href)}
                      className="rounded-xl font-bold text-xs h-9 px-4 gap-1.5 bg-slate-900 hover:bg-blue-600 text-white"
                    >
                      <span>Ouvrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Permissions Details */}
        <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Détail de vos 50 Permissions Système</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Liste complète des autorisations de micro-services accordées par la Direction Générale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isGranted = hasPermission(user, perm.code);
                return (
                  <div
                    key={perm.code}
                    className={cn(
                      "p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all",
                      isGranted 
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200" 
                        : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/40 dark:border-slate-800 opacity-50"
                    )}
                  >
                    {isGranted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold leading-tight">{perm.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{perm.categoryLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
