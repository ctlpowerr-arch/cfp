import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  LayoutDashboard, 
  Wallet, 
  Users, 
  UserSquare2, 
  BookOpen, 
  Award, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  ClipboardList, 
  ShieldCheck, 
  Gamepad2, 
  Settings, 
  Newspaper, 
  FileText,
  Moon,
  Sun,
  X,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navigationItems = [
    { title: "Tableau de Bord Général", path: "/dashboard", category: "Pilotage", icon: LayoutDashboard },
    { title: "Caisse & Trésorerie (35 Filières)", path: "/dashboard/caisse", category: "Finances", icon: Wallet },
    { title: "Inscriptions & Admissions", path: "/dashboard/registrations", category: "Scolarité", icon: FileText },
    { title: "Notes & Bulletins Officiels (DQP)", path: "/dashboard/notes-bulletins", category: "Pédagogie", icon: Award },
    { title: "Registre des Étudiants & Effectifs", path: "/dashboard/students", category: "Effectifs", icon: Users },
    { title: "Corps des Enseignants & Formateurs", path: "/dashboard/teachers", category: "Corps Professoral", icon: UserSquare2 },
    { title: "Gestion des 14 Classes & Salles", path: "/dashboard/classes", category: "Pédagogie", icon: GraduationCap },
    { title: "Émargement & Assiduité en Temps Réel", path: "/dashboard/attendance", category: "Suivi", icon: UserCheck },
    { title: "Emplois du Temps & Plannings", path: "/dashboard/schedule", category: "Organisation", icon: Calendar },
    { title: "Stages & Immersion en Entreprise", path: "/dashboard/internships", category: "Insertion", icon: Briefcase },
    { title: "Formations & Référentiels DQP (35)", path: "/dashboard/courses", category: "Filières", icon: BookOpen },
    { title: "E-learning, Cours & Ressources", path: "/dashboard/learning", category: "Pédagogie", icon: BookOpen },
    { title: "Actualités & Événements Vitrine", path: "/dashboard/news", category: "Communication", icon: Newspaper },
    { title: "Personnel & Rôles de Sécurité (RBAC)", path: "/dashboard/staff", category: "Sécurité", icon: ShieldCheck },
    { title: "Compétitions Inter-Classes & Quiz TV", path: "/dashboard/games", category: "Animation", icon: Gamepad2 },
    { title: "Rapports d'Intervention & Fiches", path: "/dashboard/reports", category: "Technique", icon: ClipboardList },
    { title: "Paramètres du Système & Établissement", path: "/dashboard/settings", category: "Système", icon: Settings },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une page, un module, des notes, la caisse..."
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm sm:text-base"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg font-mono"
            >
              Échap
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Actions rapides &amp; Navigation</span>
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:text-blue-600 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
              <span>Basculer Mode {isDark ? "Clair" : "Sombre"}</span>
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Aucun résultat pour &laquo; {query} &raquo;</p>
                <p className="text-xs text-slate-500 mt-1">Essayez avec un mot-clé comme 'caisse', 'notes', 'étudiant', 'filière'...</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900/50">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              CFP-ITMC Administration Douala Logpom
            </span>
            <span>Utilisez les flèches ou cliquez pour naviguer</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
