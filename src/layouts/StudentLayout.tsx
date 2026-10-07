import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Award, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCircle,
  Calendar,
  Gamepad2,
  ClipboardList,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  School,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentNotificationModal from '@/components/student/StudentNotificationModal';
import AppLogo from '@/components/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';

const studentBottomNavItems = [
  { label: 'Accueil', href: '/student', icon: LayoutDashboard },
  { label: 'Cours', href: '/student/modules', icon: BookOpen },
  { label: 'Notes', href: '/student/grades', icon: Award },
  { label: 'Stage', href: '/student/internship', icon: Briefcase },
  { label: 'Profil', href: '/student/settings', icon: Settings },
];

const studentNavGroups = [
  {
    group: "Formation & Évaluations",
    icon: School,
    items: [
      { label: "Tableau de bord", path: "/student", icon: LayoutDashboard },
      { label: "Mes Cours & Modules", path: "/student/modules", icon: BookOpen, badge: "DQP" },
      { label: "Notes & Bulletins", path: "/student/grades", icon: Award, badge: "Relevé" },
      { label: "Emploi du Temps", path: "/student/schedule", icon: Calendar },
    ]
  },
  {
    group: "Stages & Immersion Pro",
    icon: Briefcase,
    items: [
      { label: "Suivi de mon Stage", path: "/student/internship", icon: Briefcase, badge: "Entreprise" },
      { label: "Rapports d’Intervention", path: "/student/reports", icon: ClipboardList, badge: "Fiches" },
    ]
  },
  {
    group: "Vie Étudiante & Compte",
    icon: Settings,
    items: [
      { label: "Jeux Éducatifs TV", path: "/student/games", icon: Gamepad2, badge: "TV" },
      { label: "Mon Profil & Paramètres", path: "/student/settings", icon: Settings },
    ]
  }
];

export default function StudentLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itmc_student_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('itmc_student_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const fetchStudents = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStudentsList(data);
          const savedId = localStorage.getItem('selectedStudentId');
          if (savedId && data.some((s: any) => s.id === savedId)) {
            setSelectedStudentId(savedId);
          } else {
            setSelectedStudentId(data[0].id);
          }
        }
      })
      .catch(err => console.error("Failed to load students", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const activeStudentRaw = studentsList.find(s => s.id === selectedStudentId) || studentsList[0];

  useEffect(() => {
    const studentId = activeStudentRaw?.id || "std_101";
    const handleAvatarUpdate = () => {
      const saved = localStorage.getItem('custom_avatar_' + studentId);
      setCustomAvatar(saved);
    };
    handleAvatarUpdate();
    window.addEventListener('avatarChanged', handleAvatarUpdate);
    return () => window.removeEventListener('avatarChanged', handleAvatarUpdate);
  }, [activeStudentRaw?.id]);

  const student = {
    ...activeStudentRaw,
    id: activeStudentRaw?.id || "std_101",
    matricule: activeStudentRaw?.matricule || activeStudentRaw?.id || "21ITMC26GL001",
    name: activeStudentRaw?.name || "Victor Nya",
    promo: activeStudentRaw?.promo || "G1",
    classCode: activeStudentRaw?.classCode || activeStudentRaw?.promo || "G1-GL",
    level: activeStudentRaw?.level || `${activeStudentRaw?.promo || 'G1'} ${activeStudentRaw?.specialty || 'Génie Logiciel'}`,
    email: activeStudentRaw?.email || "victor.nya101@itmc-it.cm",
    specialty: activeStudentRaw?.specialty || "Génie Logiciel",
    department: activeStudentRaw?.department || "Informatique & Numérique",
    room: activeStudentRaw?.room || "Labo Info 1",
    attendance: activeStudentRaw?.attendance ?? 96,
    lastGrade: activeStudentRaw?.lastGrade || "17/20",
    academicYear: activeStudentRaw?.academicYear || "2026-2027",
    avatar: customAvatar || activeStudentRaw?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudentRaw?.name || 'Victor'}`,
  };

  const fetchUnreadNotifs = () => {
    if (!student.id) return;
    fetch(`/api/notifications?studentId=${student.id}&unreadOnly=true`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadNotifsCount(data.length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadNotifs();
    const interval = setInterval(fetchUnreadNotifs, 10000);
    window.addEventListener('notification_sent', fetchUnreadNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification_sent', fetchUnreadNotifs);
    };
  }, [student.id]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    localStorage.setItem('selectedStudentId', id);
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
                    Espace Étudiant / Apprenant
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

          {/* Student Selector if Multiple available */}
          {!isSidebarCollapsed && studentsList.length > 1 && (
            <div className="mb-4 px-1">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Compte Apprenant Actif :
              </label>
              <ModernSelect
                value={selectedStudentId}
                onChange={e => handleStudentChange(e.target.value)}
                className="h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classCode || s.promo || 'DQP'})
                  </option>
                ))}
              </ModernSelect>
            </div>
          )}

          {/* Grouped Nav Items */}
          <div className="space-y-4">
            {studentNavGroups.map((grp) => {
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
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>ET</AvatarFallback>
                </Avatar>
                <div className="min-w-0 truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.name}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold truncate">{student.classCode} • {student.matricule}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <Avatar className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20" title={`${student.name} (${student.classCode})`}>
                <AvatarImage src={student.avatar} />
                <AvatarFallback>ET</AvatarFallback>
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
                placeholder="Rechercher cours, module, note, stage..." 
                className="bg-slate-100/80 dark:bg-slate-800/60 border border-transparent focus:border-blue-500 rounded-xl pl-10 pr-4 py-1.5 text-xs w-56 md:w-80 font-medium focus:bg-white dark:focus:bg-slate-900 transition-all outline-none h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{student.classCode} • {student.academicYear}</span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsNotifModalOpen(true)}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Avatar className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>ET</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{student.specialty}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body Outlet */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet context={{ student }} />
        </div>

        {/* Responsive Mobile Bottom Navigation with Retraction */}
        <MobileBottomNav 
          items={studentBottomNavItems} 
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
                      <p className="text-[9px] font-bold text-slate-400">Espace Étudiant</p>
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
                  {studentNavGroups.map((grp) => {
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

      <StudentNotificationModal 
        isOpen={isNotifModalOpen} 
        onClose={() => {
          setIsNotifModalOpen(false);
          fetchUnreadNotifs();
        }}
        student={student}
      />
    </div>
  );
}
