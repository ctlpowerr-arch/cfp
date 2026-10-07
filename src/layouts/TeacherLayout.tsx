import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Zap,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  UserCheck,
  Gamepad2,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  Award,
  Clock,
  Layers,
  Compass
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TeacherNotificationDrawer from "@/components/teacher/TeacherNotificationDrawer";
import AppLogo from "@/components/AppLogo";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

const teacherBottomNavItems = [
  { label: 'Accueil', href: '/teacher', icon: LayoutDashboard },
  { label: 'Émarger', href: '/teacher/attendance', icon: UserCheck },
  { label: 'Compos', href: '/teacher/compositions', icon: FileSpreadsheet },
  { label: 'Classes', href: '/teacher/classes', icon: GraduationCap },
  { label: 'Planning', href: '/teacher/schedule', icon: Calendar },
];

const teacherNavGroups = [
  {
    group: "Activité & Évaluations",
    icon: Award,
    items: [
      { label: "Tableau de bord", path: "/teacher", icon: LayoutDashboard },
      { label: "Émargement & Présences", path: "/teacher/attendance", icon: UserCheck, badge: "Appel" },
      { label: "Compositions & Notes", path: "/teacher/compositions", icon: FileSpreadsheet, badge: "Saisie" },
    ]
  },
  {
    group: "Classes & Pédagogie",
    icon: GraduationCap,
    items: [
      { label: "Mes Classes & Effectifs", path: "/teacher/classes", icon: GraduationCap },
      { label: "Mes Modules & Cours", path: "/teacher/modules", icon: BookOpen },
      { label: "Mon Emploi du Temps", path: "/teacher/schedule", icon: Calendar },
      { label: "Annuaire des Étudiants", path: "/teacher/students", icon: Users },
    ]
  },
  {
    group: "Outils & Mon Espace",
    icon: Settings,
    items: [
      { label: "Rapports d’Intervention", path: "/teacher/reports", icon: ClipboardList, badge: "Fiches" },
      { label: "Jeux Éducatifs TV", path: "/teacher/games", icon: Gamepad2, badge: "TV" },
      { label: "Paramètres & Mon Profil", path: "/teacher/settings", icon: Settings },
    ]
  }
];

export default function TeacherLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itmc_teacher_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [teacher, setTeacher] = useState<any>(null);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('itmc_teacher_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(teachers => {
        if (Array.isArray(teachers) && teachers.length > 0) {
          setTeachersList(teachers);
          const data = localStorage.getItem('teacherData');
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const found = teachers.find((t: any) => t.id === parsed.id || t.email === parsed.email);
              if (found) {
                setTeacher(found);
                return;
              }
            } catch (e) {
              console.error(e);
            }
          }
          setTeacher(teachers[0]);
          if (user?.role !== 'admin') {
            localStorage.setItem('teacherData', JSON.stringify(teachers[0]));
            localStorage.setItem('userRole', 'teacher');
          }
        }
      })
      .catch(err => console.error("Failed to fetch teachers in layout", err));
  }, [user?.role]);

  useEffect(() => {
    if (!teacher?.id) return;
    const handleAvatarUpdate = () => {
      const saved = localStorage.getItem('custom_avatar_' + teacher.id);
      setCustomAvatar(saved);
    };
    handleAvatarUpdate();
    window.addEventListener('avatarChanged', handleAvatarUpdate);
    return () => window.removeEventListener('avatarChanged', handleAvatarUpdate);
  }, [teacher?.id]);

  const displayTeacher = teacher ? {
    ...teacher,
    avatar: customAvatar || teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name || 'Teacher'}`
  } : null;

  useEffect(() => {
    if (!teacher) return;
    const checkNotifs = () => {
      fetch(`/api/notifications?teacherId=${teacher.id}&unreadOnly=true`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const unread = data.filter((n: any) => !(Array.isArray(n.readBy) && n.readBy.includes(teacher.id))).length;
            setUnreadNotifCount(unread);
          }
        })
        .catch(() => {});
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 8000);
    window.addEventListener('notification_sent', checkNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification_sent', checkNotifs);
    };
  }, [teacher]);

  const handleTeacherChange = (id: string) => {
    const found = teachersList.find(t => t.id === id);
    if (found) {
      setTeacher(found);
      localStorage.setItem('teacherData', JSON.stringify(found));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50/70 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Desktop Retractable Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 relative z-40 shrink-0 pb-6 shadow-sm transition-all duration-300 ease-in-out select-none",
          isSidebarCollapsed ? "w-[76px]" : "w-72"
        )}
      >
        <div className={cn("pb-2 transition-all duration-300", isSidebarCollapsed ? "p-3" : "p-4")}>
          {/* Logo Header & Retract Button */}
          <div className={cn(
            "flex items-center mb-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 transition-all",
            isSidebarCollapsed ? "p-2 justify-center flex-col gap-2" : "p-2.5 justify-between gap-2"
          )}>
            <div className="flex items-center gap-2.5 min-w-0">
              <AppLogo size="sm" variant="mark" className="shrink-0" />
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">CFP-<span className="text-blue-600">ITMC</span></h1>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Espace Enseignant / Formateur
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Retract / Expand Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className="h-7 w-7 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 shrink-0 transition-all cursor-pointer"
              title={isSidebarCollapsed ? "Déplier la barre de navigation" : "Rétracter la barre de navigation"}
              aria-label={isSidebarCollapsed ? "Déplier la navigation" : "Rétracter la navigation"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Teacher Selector if Multiple available */}
          {!isSidebarCollapsed && teachersList.length > 1 && (
            <div className="mb-4 px-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Profil Formateur Actif :
              </label>
              <ModernSelect
                value={teacher?.id || ''}
                onChange={e => handleTeacherChange(e.target.value)}
                className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {teachersList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </ModernSelect>
            </div>
          )}

          {/* Grouped Nav Items */}
          <div className="space-y-4">
            {teacherNavGroups.map((grp) => {
              const GroupIcon = grp.icon;

              return (
                <div key={grp.group} className="space-y-1">
                  {!isSidebarCollapsed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
                      <GroupIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-75" />
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {grp.group}
                      </p>
                    </div>
                  ) : (
                    <div className="my-2 border-t border-slate-100 dark:border-slate-800/80 mx-2" />
                  )}
                  {grp.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={isSidebarCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                        className={cn(
                          "flex items-center rounded-2xl transition-all duration-200 group relative text-xs font-bold select-none cursor-pointer",
                          isSidebarCollapsed 
                            ? "justify-center p-2.5 h-11 w-11 mx-auto" 
                            : "justify-between px-3.5 py-2.5",
                          isActive 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/10 ring-1 ring-slate-900/5 dark:ring-white/10" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "gap-3")}>
                          <Icon className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:scale-110", 
                            isActive ? "text-blue-400 dark:text-blue-600 stroke-[2.5]" : "text-slate-400 group-hover:text-blue-600"
                          )} />
                          {!isSidebarCollapsed && <span className="tracking-tight">{item.label}</span>}
                        </div>
                        
                        {!isSidebarCollapsed && item.badge && (
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-lg font-black shrink-0 uppercase tracking-wider",
                            isActive 
                              ? "bg-blue-500/25 text-blue-200 dark:text-blue-800" 
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          )}>
                            {item.badge}
                          </span>
                        )}

                        {isSidebarCollapsed && item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* User Card in bottom Sidebar */}
        <div className="mt-auto p-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {!isSidebarCollapsed ? (
            <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 rounded-xl ring-2 ring-blue-500/20 shrink-0">
                  <AvatarImage src={displayTeacher?.avatar} />
                  <AvatarFallback>ENS</AvatarFallback>
                </Avatar>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayTeacher?.name || "Enseignant ITMC"}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold truncate">{displayTeacher?.department || "Formateur DQP"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <Avatar className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20" title={displayTeacher?.name}>
                <AvatarImage src={displayTeacher?.avatar} />
                <AvatarFallback>ENS</AvatarFallback>
              </Avatar>
            </div>
          )}

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            title={isSidebarCollapsed ? "Déconnexion" : undefined}
            className={cn(
              "rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold transition-colors text-xs cursor-pointer",
              isSidebarCollapsed ? "w-11 h-11 mx-auto p-0 flex items-center justify-center" : "w-full justify-start gap-2.5 px-3 py-2"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-xl h-9 w-9"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Quick Retract/Expand Toggle Button in Header */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={isSidebarCollapsed ? "Déplier la barre de navigation" : "Rétracter la barre de navigation"}
              aria-label="Toggle navigation"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Rechercher classe, étudiant, module..." 
                className="bg-slate-100/80 dark:bg-slate-800/60 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-1.5 text-xs w-56 md:w-80 font-medium focus:bg-white dark:focus:bg-slate-900 transition-all outline-none h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Année Académique 2026-2027</span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsNotifOpen(true)}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Avatar className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20">
                <AvatarImage src={displayTeacher?.avatar} />
                <AvatarFallback>ENS</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{displayTeacher?.name || 'Formateur'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{displayTeacher?.department || 'Pédagogie'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body Outlet */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet context={{ teacher: displayTeacher }} />
        </div>

        {/* Responsive Mobile Bottom Navigation with Retraction */}
        <MobileBottomNav 
          items={teacherBottomNavItems} 
          activeColorClass="text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50"
        />

        {/* Mobile Full Sidebar Drawer with Clean Organized Groups */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <AppLogo size="sm" variant="mark" />
                    <div>
                      <h1 className="text-sm font-black text-slate-900 dark:text-white">CFP-<span className="text-blue-600">ITMC</span></h1>
                      <p className="text-[9px] font-bold text-slate-400">Espace Enseignant</p>
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

                <div className="space-y-5 flex-1">
                  {teacherNavGroups.map((grp) => {
                    const GroupIcon = grp.icon;

                    return (
                      <div key={grp.group} className="space-y-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 mb-1">
                          <GroupIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-75" />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {grp.group}
                          </p>
                        </div>
                        {grp.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all select-none",
                                isActive 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/10" 
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={cn("w-4 h-4", isActive ? "text-blue-400 dark:text-blue-600" : "text-slate-400")} />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className={cn(
                                  "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase",
                                  isActive ? "bg-blue-500/20 text-blue-200 dark:text-blue-800" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
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

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full justify-start gap-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-bold text-xs"
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

      <TeacherNotificationDrawer 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)}
        teacher={displayTeacher}
      />
    </div>
  );
}
