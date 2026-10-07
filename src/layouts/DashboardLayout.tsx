import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Sparkles,
  FileText,
  LogOut,
  ShieldCheck,
  Calendar,
  Newspaper,
  UserCheck,
  Gamepad2,
  ClipboardList,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  School,
  Award,
  Compass,
  Sun,
  Moon,
  Shield,
  Command,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLogo from '@/components/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import MustChangePasswordModal from '@/components/MustChangePasswordModal';
import AdminNotificationDrawer from '@/components/admin/AdminNotificationDrawer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const adminBottomNavItems = [
  { label: 'Tableau', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Caisse', href: '/dashboard/caisse', icon: Wallet, permission: ['perm_manage_tuition_payments', 'perm_caisse_view_solde', 'perm_caisse_encaissement_pension'] },
  { label: 'Émargement', href: '/dashboard/attendance', icon: UserCheck },
  { label: 'Notes', href: '/dashboard/notes-bulletins', icon: Award },
  { label: 'Effectifs', href: '/dashboard/students', icon: Users, permission: ['perm_add_student', 'perm_manual_admission', 'perm_edit_student'] },
];

const navGroups = [
  {
    group: "Pilotage & Finances",
    icon: Compass,
    accentColor: "text-blue-600 dark:text-blue-400",
    items: [
      { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, shortcut: "D" },
      { title: "Caisse & Trésorerie", href: "/dashboard/caisse", icon: Wallet, permission: ["perm_manage_tuition_payments", "perm_caisse_view_solde", "perm_caisse_encaissement_pension", "perm_caisse_encaissement_inscriptions"], badge: "35 Filières" },
      { title: "Inscriptions & Admissions", href: "/dashboard/registrations", icon: FileText, permission: ["perm_generate_bulletins", "perm_manual_admission", "perm_verify_documents", "perm_manage_tuition_payments"], badge: "Nouveau" },
      { title: "Actualités & Événements", href: "/dashboard/news", icon: Newspaper, permission: ["perm_post_events", "perm_manage_landing"] },
    ]
  },
  {
    group: "Pédagogie & Examens",
    icon: School,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    items: [
      { title: "Notes & Bulletins Officiels", href: "/dashboard/notes-bulletins", icon: Award, badge: "MINEFOP" },
      { title: "Émargement & Assiduité", href: "/dashboard/attendance", icon: UserCheck, badge: "Live" },
      { title: "Emplois du Temps & Salles", href: "/dashboard/schedule", icon: Calendar, permission: ["perm_manage_prof_schedule", "perm_view_global_schedule", "perm_generate_rt_schedules", "perm_view_schedules"] },
      { title: "Suivi des Stages", href: "/dashboard/internships", icon: Briefcase, badge: "Stages" },
      { title: "Formations & Modules DQP", href: "/dashboard/courses", icon: BookOpen },
      { title: "E-learning & Ressources", href: "/dashboard/learning", icon: BookOpen },
    ]
  },
  {
    group: "Communauté & Effectifs",
    icon: Users,
    accentColor: "text-emerald-600 dark:text-emerald-400",
    items: [
      { title: "Registre des Étudiants", href: "/dashboard/students", icon: Users, permission: ["perm_add_student", "perm_manual_admission", "perm_edit_student", "perm_print_certificat_scolarite", "perm_view_students_list"] },
      { title: "Corps des Enseignants", href: "/dashboard/teachers", icon: UserSquare2, permission: ["perm_add_teacher", "perm_edit_teacher", "perm_assign_teacher_module", "perm_view_teachers"] },
      { title: "Gestion des 14 Classes", href: "/dashboard/classes", icon: GraduationCap, permission: ["perm_create_classrooms", "perm_edit_classes"] },
      { title: "Rapports d’Intervention", href: "/dashboard/reports", icon: ClipboardList, badge: "Fiches" },
    ]
  },
  {
    group: "Administration & Sécurité",
    icon: ShieldCheck,
    accentColor: "text-amber-600 dark:text-amber-400",
    items: [
      { title: "Personnel & 14 Rôles (RBAC)", href: "/dashboard/staff", icon: ShieldCheck, permission: ["perm_manage_staff", "perm_manage_system_settings"], badge: "50 Perms" },
      { title: "Compétitions & Jeux TV", href: "/dashboard/games", icon: Gamepad2, badge: "Quiz" },
      { title: "Paramètres du Système", href: "/dashboard/settings", icon: Settings, permission: ["perm_manage_system_settings"], adminOnly: true },
    ]
  }
];

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itmc_dashboard_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMustChangeModal, setShowMustChangeModal] = useState(false);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setLightMode, setDarkMode, isDark } = useTheme();

  const fetchUnreadAdminCount = () => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const readerId = user?.id || user?.email || 'admin';
          const unread = data.filter((n: any) => !(Array.isArray(n.readBy) && n.readBy.includes(readerId))).length;
          setUnreadAdminCount(unread);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadAdminCount();
    const interval = setInterval(fetchUnreadAdminCount, 8000);
    window.addEventListener('notification_sent', fetchUnreadAdminCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification_sent', fetchUnreadAdminCount);
    };
  }, [user]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('itmc_dashboard_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (user && (user as any).mustChangePassword === true) {
      setShowMustChangeModal(true);
    } else {
      setShowMustChangeModal(false);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on page change
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    setIsSearchModalOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasPermission = (item: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (item.adminOnly && !user.permissions?.includes('perm_manage_system_settings')) return false;
    if (!item.permission) return true;
    if (Array.isArray(item.permission)) {
      return item.permission.some((p: string) => user.permissions?.includes(p));
    }
    return user.permissions?.includes(item.permission);
  };

  const filteredBottomNavItems = adminBottomNavItems.filter(hasPermission);

  // Search filtered nav items
  const allNavItems = navGroups.flatMap(g => g.items.filter(hasPermission));
  const searchResults = searchQuery.trim() === '' 
    ? allNavItems.slice(0, 8) 
    : allNavItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Current Active Page Info for Breadcrumbs
  const currentNavInfo = useMemo(() => {
    for (const grp of navGroups) {
      for (const item of grp.items) {
        if (location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))) {
          return { group: grp.group, item };
        }
      }
    }
    return { group: "Pilotage & Finances", item: { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard } };
  }, [location.pathname]);

  return (
    <div className={cn(
      "flex h-screen overflow-hidden font-sans transition-colors duration-200 antialiased",
      isDark ? "bg-[#060913] text-slate-100 dark" : "bg-[#F4F6FB] text-slate-900"
    )}>
      
      {/* ================= DESKTOP RETRACTABLE SIDEBAR ================= */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full overflow-y-auto custom-scrollbar relative z-40 shrink-0 select-none transition-all duration-300 ease-in-out border-r",
          isDark 
            ? "bg-[#0A0F1E] border-slate-800/80 shadow-[4px_0_24px_rgba(0,0,0,0.5)]" 
            : "bg-white border-slate-200/90 shadow-[4px_0_24px_rgba(0,0,0,0.03)]",
          isSidebarCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        {/* Top Brand Header */}
        <div className={cn("p-4 pb-2 transition-all duration-300", isSidebarCollapsed && "px-2.5")}>
          <div className={cn(
            "flex items-center rounded-2xl border transition-all duration-200",
            isDark 
              ? "bg-[#0F172E] border-slate-800/90 shadow-inner" 
              : "bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-slate-200/90 shadow-xs",
            isSidebarCollapsed ? "p-2 justify-center flex-col gap-2" : "p-2.5 justify-between gap-2"
          )}>
            {/* Logo Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl border border-blue-500/25 shadow-xs shrink-0 bg-white p-0.5 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/10">
                <img 
                  src="/logo.jpg" 
                  alt="CFP-ITMC Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className={cn("text-sm font-black tracking-tight", isDark ? "text-white" : "text-slate-950")}>
                      CFP-<span className="text-blue-600">ITMC</span>
                    </h1>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <p className={cn("text-[10px] font-bold truncate tracking-tight", isDark ? "text-slate-400" : "text-slate-600")}>
                    {user?.role === 'admin' ? "Super Administration" : "Espace Secrétariat"}
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className={cn(
                "h-7 w-7 rounded-lg shrink-0 transition-all cursor-pointer shadow-xs",
                isDark 
                  ? "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-white border border-slate-200/90 bg-white/70"
              )}
              title={isSidebarCollapsed ? "Déplier la navigation" : "Rétracter la navigation"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Categories List */}
        <div className="flex-1 px-3 py-2 space-y-4">
          {navGroups.map((grp) => {
            const visibleItems = grp.items.filter(hasPermission);
            if (visibleItems.length === 0) return null;
            const GroupIcon = grp.icon;

            return (
              <div key={grp.group} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <div className="flex items-center gap-2 px-3 py-1 mb-1">
                    <GroupIcon className={cn("w-3.5 h-3.5 shrink-0", grp.accentColor)} />
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-wider",
                      isDark ? "text-slate-500" : "text-slate-500"
                    )}>
                      {grp.group}
                    </p>
                  </div>
                ) : (
                  <div className={cn("my-2 border-t mx-2", isDark ? "border-slate-800/80" : "border-slate-200/90")} />
                )}

                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      title={isSidebarCollapsed ? `${item.title}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 group relative text-xs font-bold select-none cursor-pointer",
                        isSidebarCollapsed 
                          ? "justify-center p-2.5 h-11 w-11 mx-auto" 
                          : "justify-between px-3.5 py-2.5",
                        isActive 
                          ? isDark
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-500/10 font-black"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-blue-600 font-black"
                          : isDark
                            ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent"
                            : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 border border-transparent hover:border-slate-200/80"
                      )}
                    >
                      <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "gap-3")}>
                        <Icon className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-110", 
                          isActive 
                            ? isDark ? "text-blue-400 stroke-[2.5]" : "text-white stroke-[2.5]" 
                            : isDark ? "text-slate-400 group-hover:text-blue-400" : "text-slate-500 group-hover:text-blue-600 stroke-[2]"
                        )} />
                        {!isSidebarCollapsed && (
                          <span className={cn(
                            "tracking-tight transition-colors",
                            isActive ? (isDark ? "text-white font-black" : "text-white font-black") : "font-bold"
                          )}>
                            {item.title}
                          </span>
                        )}
                      </div>
                      
                      {!isSidebarCollapsed && item.badge && (
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md font-extrabold shrink-0 uppercase tracking-wider",
                          isActive 
                            ? isDark 
                              ? "bg-blue-500/30 text-blue-200 border border-blue-400/40" 
                              : "bg-white/20 text-white border border-white/30" 
                            : isDark
                              ? "bg-slate-800/90 text-slate-300 border border-slate-700"
                              : "bg-blue-50 text-blue-700 border border-blue-200/80 font-black shadow-2xs"
                        )}>
                          {item.badge}
                        </span>
                      )}

                      {isSidebarCollapsed && item.badge && (
                        <span className={cn(
                          "absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2",
                          isDark ? "ring-[#0A0F1E]" : "ring-white"
                        )} />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User Card & Quick Actions */}
        <div className={cn(
          "mt-auto p-3 border-t",
          isDark ? "border-slate-800/80 bg-[#080D1B]" : "border-slate-200/90 bg-slate-50/90"
        )}>
          {!isSidebarCollapsed ? (
            <div className="space-y-2 mb-1">
              <div className={cn(
                "p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs",
                isDark ? "bg-[#0F172E] border-slate-800" : "bg-white border-slate-200/90"
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 rounded-lg ring-1 ring-blue-500/30 shrink-0 shadow-2xs">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'AdminITMC'}`} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">AD</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 truncate">
                    <p className={cn("text-xs font-black truncate", isDark ? "text-white" : "text-slate-950")}>
                      {user?.name || "Admin ITMC"}
                    </p>
                    <p className={cn("text-[10px] font-bold truncate flex items-center gap-1", isDark ? "text-emerald-400" : "text-emerald-600")}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      En ligne • Douala
                    </p>
                  </div>
                </div>

                {/* Quick theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 border",
                    isDark 
                      ? "text-amber-400 bg-slate-800/90 border-slate-700 hover:bg-slate-700" 
                      : "text-slate-700 bg-slate-100/90 border-slate-200/80 hover:bg-slate-200 hover:text-blue-600"
                  )}
                  title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Secure Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer",
                  isDark 
                    ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40"
                    : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                )}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Déconnexion Sécurisée</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs",
                  isDark ? "text-amber-400 bg-slate-900 hover:bg-slate-800 border border-slate-800" : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-600"
                )}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs",
                  isDark ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800" : "text-rose-600 bg-white border border-slate-200 hover:bg-rose-50"
                )}
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN APPLICATION CANVAS ================= */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header className={cn(
          "h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 border-b backdrop-blur-xl transition-colors shrink-0",
          isDark 
            ? "bg-[#0A0F1E]/90 border-slate-800/80 shadow-md shadow-black/20" 
            : "bg-white/95 border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
        )}>
          
          {/* Left Side: Mobile Toggle, Desktop Retract, Breadcrumbs & Search */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Open */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("lg:hidden rounded-xl h-9 w-9 cursor-pointer", isDark ? "text-slate-300" : "text-slate-700 hover:bg-slate-100")}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Retract Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className={cn(
                "hidden lg:flex rounded-xl h-9 w-9 cursor-pointer transition-colors border",
                isDark 
                  ? "text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-100 border-slate-200/80 shadow-2xs"
              )}
              title={isSidebarCollapsed ? "Déplier la navigation" : "Rétracter la navigation"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>

            {/* Breadcrumb Context Indicator */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-semibold px-2 py-1">
              <span className={cn(isDark ? "text-slate-500" : "text-slate-400")}>
                {currentNavInfo.group}
              </span>
              <span className={cn(isDark ? "text-slate-700" : "text-slate-300")}>/</span>
              <span className={cn("font-bold", isDark ? "text-blue-400" : "text-blue-700")}>
                {currentNavInfo.item.title}
              </span>
            </div>

            {/* Quick Command Search Bar Button */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className={cn(
                "hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs",
                isDark 
                  ? "bg-[#0F172E] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200" 
                  : "bg-slate-100/90 border-slate-200/90 text-slate-600 hover:border-blue-300 hover:text-slate-900 hover:bg-white",
                "w-56 md:w-64 lg:w-72 justify-between"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Rechercher une section...</span>
              </div>
              <kbd className={cn(
                "px-1.5 py-0.5 text-[10px] font-mono rounded-md border shrink-0",
                isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-700 shadow-2xs"
              )}>
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Side: Academic Badge, Theme Toggle, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Academic Session Badge */}
            <div className={cn(
              "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black",
              isDark 
                ? "bg-blue-950/40 border-blue-500/30 text-blue-300 shadow-inner" 
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 shadow-2xs"
            )}>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Session 2026-2027</span>
            </div>

            {/* Theme Segmented Switcher in Header */}
            <div className={cn(
              "flex items-center p-0.5 sm:p-1 rounded-xl border shadow-2xs transition-all",
              isDark ? "bg-[#0F172E] border-slate-800" : "bg-slate-100/90 border-slate-200/90"
            )}>
              <button
                type="button"
                onClick={setLightMode}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                  !isDark 
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/90 font-black" 
                    : "text-slate-400 hover:text-slate-200"
                )}
                title="Activer le Mode Clair"
              >
                <Sun className={cn("w-3.5 h-3.5", !isDark ? "text-amber-500 fill-amber-400" : "text-slate-400")} />
                <span className="hidden sm:inline text-[11px]">Clair</span>
              </button>
              
              <button
                type="button"
                onClick={setDarkMode}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                  isDark 
                    ? "bg-blue-600 text-white shadow-xs border border-blue-500/40 font-black" 
                    : "text-slate-600 hover:text-slate-900"
                )}
                title="Activer le Mode Sombre"
              >
                <Moon className={cn("w-3.5 h-3.5", isDark ? "text-blue-200 fill-blue-200" : "text-slate-400")} />
                <span className="hidden sm:inline text-[11px]">Sombre</span>
              </button>
            </div>

            {/* Notification Bell */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative rounded-xl h-9 w-9 cursor-pointer transition-colors border shadow-2xs",
                isDark 
                  ? "text-slate-400 bg-slate-900 hover:text-white hover:bg-slate-800 border-slate-800" 
                  : "text-slate-700 bg-white hover:text-blue-600 hover:bg-slate-100 border-slate-200/90"
              )}
              onClick={() => setIsAdminNotifOpen(true)}
              title="Notifications administratives"
            >
              <Bell className="w-4 h-4" />
              {unreadAdminCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 animate-pulse shadow-sm",
                  isDark ? "ring-[#0A0F1E]" : "ring-white"
                )}>
                  {unreadAdminCount}
                </span>
              )}
            </Button>

            {/* User Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className={cn(
                  "flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 rounded-xl border transition-all cursor-pointer shadow-xs",
                  isDark 
                    ? "bg-[#0F172E] border-slate-800 hover:border-slate-700" 
                    : "bg-white border-slate-200/90 hover:border-blue-300 hover:bg-slate-50"
                )}
              >
                <Avatar className="h-7 w-7 rounded-lg ring-1 ring-blue-500/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">AD</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className={cn("text-xs font-black leading-tight", isDark ? "text-white" : "text-slate-950")}>
                    {user?.name || 'Direction'}
                  </p>
                  <p className={cn("text-[10px] capitalize leading-none font-bold", isDark ? "text-slate-400" : "text-slate-500")}>
                    {user?.role === 'admin' ? 'Super Admin' : 'Secrétariat'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className={cn(
                      "absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50",
                      isDark ? "bg-[#0F172E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xl"
                    )}
                  >
                    <div className={cn("p-2.5 pb-2 border-b", isDark ? "border-slate-800" : "border-slate-100")}>
                      <p className="text-xs font-black truncate">{user?.name || 'Direction Générale'}</p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">{user?.email || 'admin@itmc-it.cm'}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors",
                          isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <Settings className="w-3.5 h-3.5 text-blue-600" />
                        <span>Paramètres système</span>
                      </Link>

                      <Link
                        to="/"
                        target="_blank"
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors",
                          isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Voir le site vitrine</span>
                        </div>
                      </Link>
                    </div>

                    <div className={cn("pt-1 border-t", isDark ? "border-slate-800" : "border-slate-100")}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          items={filteredBottomNavItems} 
          activeColorClass={isDark ? "text-blue-400 bg-blue-950/60" : "text-blue-700 bg-blue-50"}
        />

        {/* Mobile Full Sidebar Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "fixed inset-y-0 left-0 w-72 border-r z-50 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:hidden",
                  isDark ? "bg-[#0A0F1E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                )}
              >
                <div className={cn("flex items-center justify-between pb-4 border-b mb-4", isDark ? "border-slate-800" : "border-slate-100")}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 border border-slate-200">
                      <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h1 className="text-sm font-black text-slate-950 dark:text-white">CFP-<span className="text-blue-600">ITMC</span></h1>
                      <p className="text-[9px] font-bold text-slate-500">Navigation</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 flex-1">
                  {navGroups.map((grp) => {
                    const visibleItems = grp.items.filter(hasPermission);
                    if (visibleItems.length === 0) return null;
                    const GroupIcon = grp.icon;

                    return (
                      <div key={grp.group} className="space-y-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
                          <GroupIcon className={cn("w-3.5 h-3.5", grp.accentColor)} />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {grp.group}
                          </p>
                        </div>
                        {visibleItems.map((item) => {
                          const isActive = location.pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none",
                                isActive 
                                  ? isDark
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-black"
                                  : isDark
                                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                                <span>{item.title}</span>
                              </div>
                              {item.badge && (
                                <span className={cn(
                                  "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase",
                                  isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200/60"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className={cn("pt-4 border-t mt-auto", isDark ? "border-slate-800" : "border-slate-100")}>
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full justify-start gap-2.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded-xl font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </main>

      {/* Quick Command Palette Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={cn(
                "w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden",
                isDark ? "bg-[#0A0F1E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
              )}
            >
              {/* Search input */}
              <div className={cn("p-3.5 border-b flex items-center gap-3", isDark ? "border-slate-800" : "border-slate-100")}>
                <Search className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher une section, un module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-sm font-semibold placeholder:text-slate-400"
                />
                <kbd className={cn("text-[10px] font-mono px-2 py-0.5 rounded-md border", isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600")}>
                  ESC
                </kbd>
              </div>

              {/* Results list */}
              <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          navigate(item.href);
                          setIsSearchModalOpen(false);
                          setSearchQuery('');
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer",
                          isDark 
                            ? "hover:bg-slate-800/80 text-slate-200" 
                            : "hover:bg-blue-50/70 hover:text-blue-900 text-slate-800"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", isDark ? "bg-slate-800 text-blue-400" : "bg-blue-100 text-blue-700")}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className={cn("text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase", isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-800")}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="p-6 text-center text-xs text-slate-400 font-medium">Aucun résultat trouvé.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MustChangePasswordModal 
        isOpen={showMustChangeModal} 
        email={user?.email || ''}
        onSuccess={() => setShowMustChangeModal(false)}
      />

      <AdminNotificationDrawer
        isOpen={isAdminNotifOpen}
        onClose={() => setIsAdminNotifOpen(false)}
        adminUser={user}
        onUnreadCountChange={setUnreadAdminCount}
      />

    </div>
  );
}
