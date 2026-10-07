import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  Shield, 
  Users, 
  GraduationCap, 
  UserCheck,
  Brain,
  Cpu,
  HelpCircle,
  Phone,
  MapPin
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, UserRole } from '@/context/AuthContext';
import { isInjectionPayload, sanitizeInput } from '@/lib/security';

export default function TeacherLoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setSecurityMessage } = useAuth();

  // Determine initial role
  const getInitialRole = (): UserRole => {
    const roleParam = searchParams.get('role')?.toLowerCase() as UserRole | null;
    if (roleParam && ['admin', 'secretary', 'teacher', 'student'].includes(roleParam)) {
      return roleParam;
    }
    const path = location.pathname.toLowerCase();
    const fromPath = (location.state as any)?.from?.pathname?.toLowerCase() || '';
    if (path.includes('admin') || fromPath.startsWith('/dashboard')) return 'admin';
    if (path.includes('student') || fromPath.startsWith('/student')) return 'student';
    if (path.includes('secretary')) return 'secretary';
    return 'admin';
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>(getInitialRole);
  const [email, setEmail] = useState<string>(() => {
    const initRole = getInitialRole();
    if (initRole === 'admin') return 'admin@itmc-it.cm';
    if (initRole === 'student') return 'student@itmc-it.cm';
    if (initRole === 'secretary') return 'm.ngo@itmc-it.cm';
    return 'jp.kamga@itmc-it.cm';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [secretariesList, setSecretariesList] = useState<any[]>([]);

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toLowerCase() as UserRole | null;
    const path = location.pathname.toLowerCase();
    const fromPath = (location.state as any)?.from?.pathname?.toLowerCase() || '';

    let detected: UserRole | null = null;
    if (roleParam && ['admin', 'secretary', 'teacher', 'student'].includes(roleParam)) {
      detected = roleParam;
    } else if (path.includes('admin') || fromPath.startsWith('/dashboard')) {
      detected = 'admin';
    } else if (path.includes('student') || fromPath.startsWith('/student')) {
      detected = 'student';
    } else if (path.includes('secretary')) {
      detected = 'secretary';
    }

    if (detected) {
      setSelectedRole(detected);
      if (detected === 'admin') setEmail('admin@itmc-it.cm');
      else if (detected === 'student') setEmail('student@itmc-it.cm');
      else if (detected === 'secretary') setEmail('m.ngo@itmc-it.cm');
      else setEmail('jp.kamga@itmc-it.cm');
    }
  }, [location, searchParams]);

  useEffect(() => {
    fetch('/api/secretaries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSecretariesList(data);
      })
      .catch(() => {});
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setError('');
    if (newRole === 'admin') setEmail('admin@itmc-it.cm');
    else if (newRole === 'student') setEmail('student@itmc-it.cm');
    else if (newRole === 'secretary') setEmail(secretariesList[0]?.email || 'm.ngo@itmc-it.cm');
    else setEmail('jp.kamga@itmc-it.cm');
  };

  const handleLogin = async (e?: React.FormEvent, targetEmail?: string, targetRole?: UserRole) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    if (setSecurityMessage) setSecurityMessage(null);

    const roleToUse = targetRole || selectedRole;
    let loginEmail = targetEmail || email;
    if (!loginEmail) {
      loginEmail = roleToUse === 'admin' 
        ? 'admin@itmc-it.cm' 
        : roleToUse === 'student' 
        ? 'student@itmc-it.cm' 
        : roleToUse === 'secretary'
        ? (secretariesList[0]?.email || 'm.ngo@itmc-it.cm')
        : 'jp.kamga@itmc-it.cm';
    }

    if (isInjectionPayload(loginEmail) || isInjectionPayload(password)) {
      setError("Requête bloquée par le pare-feu de sécurité.");
      setLoading(false);
      return;
    }

    try {
      const cleanEmail = sanitizeInput(loginEmail);
      const matchedSec = roleToUse === 'secretary' ? secretariesList.find(s => s.email.toLowerCase() === cleanEmail.toLowerCase()) : null;

      const userSession = {
        id: roleToUse === 'admin' ? 'ADM-001' : roleToUse === 'student' ? 'STD-001' : roleToUse === 'secretary' ? (matchedSec?.id || 'SEC-001') : 'TCH-001',
        name: roleToUse === 'admin' 
          ? 'Direction Générale' 
          : roleToUse === 'student' 
          ? 'Étudiant CFP-ITMC' 
          : roleToUse === 'secretary' 
          ? (matchedSec?.name || 'Secrétaire Scolaire') 
          : 'Formateur Expert',
        email: cleanEmail,
        role: roleToUse,
        functionTitle: roleToUse === 'admin' 
          ? 'Super Administrateur' 
          : roleToUse === 'secretary' 
            ? (matchedSec?.functionTitle || 'Secrétariat')
            : roleToUse === 'student'
              ? 'Apprenant'
              : 'Formateur',
        department: matchedSec?.department || (roleToUse === 'admin' ? 'Direction' : undefined),
        phone: matchedSec?.phone,
        permissions: roleToUse === 'admin' 
          ? ['all', 'admin', 'superadmin'] 
          : roleToUse === 'secretary' 
            ? (matchedSec?.permissions || ["perm_manual_admission", "perm_manage_tuition_payments"]) 
            : [roleToUse],
        loginTime: Date.now()
      };

      const success = await login(userSession);
      if (success) {
        if (rememberMe) {
          localStorage.setItem('teacherData', JSON.stringify(userSession));
          localStorage.setItem('userRole', roleToUse);
        }

        const fromPath = (location.state as any)?.from?.pathname || '';
        let redirectPath = '/dashboard';
        if (roleToUse === 'admin' || roleToUse === 'secretary') {
          redirectPath = fromPath.startsWith('/dashboard') ? fromPath : '/dashboard';
        } else if (roleToUse === 'student') {
          redirectPath = fromPath.startsWith('/student') ? fromPath : '/student';
        } else {
          redirectPath = fromPath.startsWith('/teacher') ? fromPath : '/teacher';
        }

        navigate(redirectPath, { replace: true });
      } else {
        setError("Identifiants incorrects. Veuillez vérifier votre adresse ou mot de passe.");
      }
    } catch (err) {
      setError("Erreur de connexion avec le serveur académique.");
    } finally {
      setLoading(false);
    }
  };

  const roleTabs = [
    { key: 'admin', label: 'Admin', icon: Shield },
    { key: 'secretary', label: 'Secrétariat', icon: Users },
    { key: 'teacher', label: 'Enseignant', icon: GraduationCap },
    { key: 'student', label: 'Étudiant', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background Soft Depth */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200/70" />

      {/* Main Two-Column Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/80 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]"
      >
        
        {/* ================= LEFT SIDE: VIBRANT ROYAL BLUE BRAND PANEL ================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Circuit / Tech Pattern in Background */}
          <div className="absolute -bottom-10 -right-10 text-white/[0.07] pointer-events-none select-none">
            <Cpu className="w-72 h-72" strokeWidth={0.8} />
          </div>
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Top content */}
          <div className="relative z-10">
            {/* Brain / Tech Icon Container */}
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white mb-8 shadow-inner">
              <Brain className="w-8 h-8" />
            </div>

            {/* Main Welcome Heading */}
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Bienvenue à <br />
              CFP-ITMC
            </h1>

            {/* Description */}
            <p className="text-white/90 text-sm sm:text-base font-normal mt-4 leading-relaxed">
              Accédez à votre tableau de bord pour gérer vos cours, suivre votre progression et interagir avec la communauté académique.
            </p>
          </div>

          {/* Bottom Security / Academic Year Pill */}
          <div className="relative z-10 pt-8 mt-8">
            <div className="p-4 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-xs text-white leading-tight">
                <span className="font-bold block">Portail Certifié &amp; Chiffré</span>
                <span className="text-white/80 text-[11px]">Session Académique 2026 - 2027</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDE: CRISP WHITE LOGIN FORM ================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          
          <div>
            {/* Top Logo & Institution Name Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full border border-slate-200 shadow-xs overflow-hidden shrink-0 bg-white p-0.5 flex items-center justify-center">
                <img 
                  src="/logo.jpg" 
                  alt="Logo CFP-ITMC" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="text-sm font-extrabold text-blue-600 uppercase tracking-wide block leading-none">
                  CFP-ITMC
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                  CENTRE DE FORMATION PROFESSIONNELLE
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6">
              Connexion à votre compte
            </h2>

            {/* 4 Role Selector Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between gap-1 mb-6 border border-slate-200/60">
              {roleTabs.map((tab) => {
                const isActive = selectedRole === tab.key;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleRoleChange(tab.key as UserRole)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Form */}
            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Adresse Email
                </label>
                <Input 
                  type="email" 
                  placeholder="admin@itmc-it.cm" 
                  className="h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 px-4 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Mot de passe
                </label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Entrez votre mot de passe" 
                    className="h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 px-4 pr-11 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99] cursor-pointer mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </span>
                ) : (
                  <span>Se connecter</span>
                )}
              </Button>

            </form>

          </div>

          {/* Bottom Card Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour au site vitrine</span>
            </Link>

            <span className="text-[11px] font-medium text-slate-400">
              Sécurité SSL • CFP-ITMC
            </span>
          </div>

        </div>

      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Assistance &amp; Accès</h3>
                  <p className="text-xs text-slate-400">Secrétariat CFP-ITMC</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Pour réinitialiser votre mot de passe ou obtenir vos identifiants académiques :
              </p>

              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 text-xs mb-5 border border-slate-200/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">WhatsApp :</span>
                  <a href="https://wa.me/237683663222" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">
                    +237 683 66 32 22
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Secrétariat :</span>
                  <a href="tel:+237688052094" className="font-bold text-blue-600 hover:underline">
                    +237 688 05 20 94
                  </a>
                </div>
              </div>

              <Button 
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs h-10 cursor-pointer"
              >
                Fermer
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
