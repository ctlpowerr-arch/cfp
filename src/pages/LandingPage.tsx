import React, { useState, useEffect, useRef } from 'react';
import { ModernSelect } from '@/components/ui/select';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Zap,
  Play,
  MapPin,
  Phone,
  Mail,
  Share2,
  Users as UsersIcon,
  Star as StarIcon,
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  Menu,
  Upload,
  User,
  FileText,
  Check,
  AlertCircle,
  BookOpen,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Tv,
  Car,
  Laptop,
  Building2,
  BarChart3,
  Award,
  Wrench,
  Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SpecialtyDetailModal from '@/components/SpecialtyDetailModal';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { defaultSpecialties, FILIERES, SpecialtyItem, enrichSpecialty, heroCampusBanner, industrieBanner, informatiqueBanner } from '@/data/specialtiesData';
import { getStoredNews } from '@/data/newsData';
import { NewsArticle } from '@/types';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { toast } from 'sonner';
import { sendRegistrationNotification } from '@/services/emailService';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

function AnimatedCounter({ value, duration = 1.4, className }: { value: string | number; duration?: number; className?: string }) {
  const [count, setCount] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  const numericString = String(value).replace(/[^0-9]/g, '');
  const numericValue = parseInt(numericString, 10) || 0;
  const suffix = String(value).replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;

    const end = numericValue;
    if (end === 0) {
      setCount(0);
      return;
    }
    
    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (cubic ease out)
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOutProgress * end);
      
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasAnimated, numericValue, duration]);

  return (
    <motion.span 
      ref={elementRef} 
      animate={hasAnimated ? { scale: [1, 1.15, 1], y: [0, -4, 0] } : {}}
      transition={{ duration: 0.4, delay: 0.1, times: [0, 0.5, 1] }}
      className={cn("tabular-nums inline-block font-black", className)}
    >
      {count.toLocaleString('fr-FR')}
      {suffix}
    </motion.span>
  );
}

const getFiliereIcon = (id: string, className = "w-4 h-4") => {
  switch (id) {
    case 'batiment':
    case 'btp':
      return <Building2 className={className} />;
    case 'industrie':
    case 'automobile':
    case 'energie':
      return <Wrench className={className} />;
    case 'informatique':
    case 'numerique':
      return <Laptop className={className} />;
    case 'administration':
    case 'gestion':
      return <Briefcase className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<string>('all');
  const [activeSpecialtyId, setActiveSpecialtyId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showAllSpecialties, setShowAllSpecialties] = useState<boolean>(false);
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);

  // Hero Video Banner Player State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(8);
  const [videoSrc, setVideoSrc] = useState<string>('/banner.mp4');

  const handleVideoError = () => {
    // If the local /banner.mp4 is not found, fallback to a beautiful digital tech abstract loop
    if (videoSrc === '/banner.mp4') {
      setVideoSrc('https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-technology-background-41843-large.mp4');
    }
  };

  useEffect(() => {
    const loadNews = () => {
      const pub = getStoredNews().filter(a => a.status === 'published').slice(0, 3);
      setRecentNews(pub);
    };
    loadNews();
    window.addEventListener('cfpitmc_news_updated', loadNews);
    return () => window.removeEventListener('cfpitmc_news_updated', loadNews);
  }, []);

  // Programmatic autoplay logic to bypass browser restrictions
  useEffect(() => {
    let active = true;
    const playVideo = () => {
      if (videoRef.current && active) {
        videoRef.current.muted = true;
        setIsVideoMuted(true);
        videoRef.current.play()
          .then(() => {
            if (active) {
              setIsVideoPlaying(true);
            }
          })
          .catch(err => {
            console.log("Autoplay was prevented by browser, waiting for first interaction:", err);
          });
      }
    };

    // Attempt autoplay immediately
    playVideo();

    // In case the browser strict policies block it, we also play on the first scroll or click
    const handleInteraction = () => {
      playVideo();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction, { passive: true });

    return () => {
      active = false;
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [videoSrc]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 8;
      setVideoCurrentTime(current);
      setVideoDuration(dur);
      setVideoProgress((current / dur) * 100);
    }
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPercent = parseFloat(e.target.value);
    if (videoRef.current && videoDuration) {
      const newTime = (seekPercent / 100) * videoDuration;
      videoRef.current.currentTime = newTime;
      setVideoProgress(seekPercent);
    }
  };

  const toggleVideoFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Multi-step Registration states
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);
  const [regStep, setRegStep] = useState<number>(1);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [regError, setRegError] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [regFormData, setRegFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialtyId: '',
    timeSlot: 'morning' // morning (8h-14h) or evening (16h-22h)
  });

  const [regFiles, setRegFiles] = useState<{
    diploma: File | null;
    birthCertificate: File | null;
    medicalCertificate: File | null;
    cni: File | null;
  }>({
    diploma: null,
    birthCertificate: null,
    medicalCertificate: null,
    cni: null
  });

  const [uploadProgress, setUploadProgress] = useState<{
    diploma?: number;
    birthCertificate?: number;
    medicalCertificate?: number;
    cni?: number;
  }>({});

  useEffect(() => {
    // Clear legacy v4 key if present
    localStorage.removeItem('cfpitmc_specialties_v4');
    const stored = localStorage.getItem('cfpitmc_specialties_v5');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 35 && parsed.some(p => p.id === 'tuyauterie')) {
          const enriched = parsed.map(sp => enrichSpecialty(sp));
          setSpecialties(enriched);
        } else {
          setSpecialties(defaultSpecialties);
          localStorage.setItem('cfpitmc_specialties_v5', JSON.stringify(defaultSpecialties));
        }
      } catch (e) {
        setSpecialties(defaultSpecialties);
        localStorage.setItem('cfpitmc_specialties_v5', JSON.stringify(defaultSpecialties));
      }
    } else {
      setSpecialties(defaultSpecialties);
      localStorage.setItem('cfpitmc_specialties_v5', JSON.stringify(defaultSpecialties));
    }
  }, []);

  // Sync state if localStorage changes (e.g. from dashboard)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('cfpitmc_specialties_v5');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length === 35 && parsed.some(p => p.id === 'tuyauterie')) {
            const enriched = parsed.map(sp => enrichSpecialty(sp));
            setSpecialties(enriched);
          } else {
            setSpecialties(defaultSpecialties);
          }
        } catch (e) {
          setSpecialties(defaultSpecialties);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handler for manual file input select
  const handleFileChange = (field: 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni', file: File | null) => {
    if (!file) return;
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [field]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setRegFiles(prev => ({ ...prev, [field]: file }));
      }
    }, 100);
  };

  // Handler for file Drag & Drop
  const handleFileDrop = (field: 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni', e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(field, file);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!regFormData.firstName || !regFormData.lastName || !regFormData.phone) {
      setRegError('Veuillez remplir toutes les informations personnelles obligatoires.');
      return;
    }
    if (!regFormData.specialtyId) {
      setRegError('Veuillez sélectionner la spécialité de votre choix.');
      return;
    }

    setRegError('');
    setIsSubmitting(true);

    const fileToBase64 = (file: File | null): Promise<string | null> => {
      return new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
      });
    };

    try {
      const diplomaBase64 = await fileToBase64(regFiles.diploma);
      const birthBase64 = await fileToBase64(regFiles.birthCertificate);
      const medicalBase64 = await fileToBase64(regFiles.medicalCertificate);
      const cniBase64 = await fileToBase64(regFiles.cni);

      const targetSpecialty = specialties.find(s => s.id === regFormData.specialtyId);
      const specialtyName = targetSpecialty ? targetSpecialty.name : 'Formation Générale';

      const newRegistration = {
        id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${regFormData.firstName} ${regFormData.lastName}`,
        firstName: regFormData.firstName,
        lastName: regFormData.lastName,
        level: targetSpecialty?.levelRequired || 'Niveau 1',
        status: 'En attente',
        email: regFormData.email || `${regFormData.firstName.toLowerCase()}.${regFormData.lastName.toLowerCase()}@cfp-itmc.com`,
        phone: regFormData.phone,
        specialty: specialtyName,
        specialtyId: regFormData.specialtyId,
        timeSlot: regFormData.timeSlot === 'morning' ? 'Matin (8h - 14h)' : 'Soir (16h - 22h)',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regFormData.firstName}`,
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        fullDate: new Date().toISOString(),
        documents: {
          diploma: diplomaBase64,
          birthCertificate: birthBase64,
          medicalCertificate: medicalBase64,
          cni: cniBase64
        }
      };

      // Save to server API
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRegistration),
      });

      if (!response.ok) {
        throw new Error('Failed to save registration on server');
      }

      // Automatically dispatch EmailJS Notification to administration
      try {
        const emailResult = await sendRegistrationNotification({
          id: newRegistration.id,
          name: newRegistration.name,
          firstName: newRegistration.firstName,
          lastName: newRegistration.lastName,
          phone: newRegistration.phone,
          email: newRegistration.email,
          specialty: newRegistration.specialty,
          timeSlot: newRegistration.timeSlot,
          level: newRegistration.level,
          registrationDate: newRegistration.registrationDate,
          documents: newRegistration.documents
        });

        if (emailResult.success) {
          toast.success("Notification d'inscription transmise à la direction académique !");
        }
      } catch (emailErr) {
        console.warn("Notice EmailJS :", emailErr);
      }

      // Dispatch storage event (optional, for local tabs)
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setIsSubmitting(false);
        setRegSuccess(true);
      }, 1000);
    } catch (error) {
      console.error("Error saving registration:", error);
      setIsSubmitting(false);
      setRegError("Une erreur est survenue lors de l'enregistrement de votre dossier sur le serveur.");
    }
  };

  const handleOpenRegistration = (specialtyId?: string) => {
    if (specialtyId) {
      setRegFormData(prev => ({ ...prev, specialtyId }));
    }
    setRegStep(1);
    setRegSuccess(false);
    setRegError('');
    setIsRegistrationModalOpen(true);
  };

  const rawActiveSpecialty = specialties.find(s => s.id === activeSpecialtyId) || null;
  const activeSpecialty = rawActiveSpecialty ? enrichSpecialty(rawActiveSpecialty) : null;

  const filteredSpecialties = specialties.filter(item => {
    return selectedFiliere === 'all' || item.filiere.toLowerCase() === selectedFiliere.toLowerCase();
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 w-full overflow-x-hidden">
      {/* Unified Floating Navbar */}
      <PublicNavbar onOpenRegistration={() => handleOpenRegistration()} showSpacer={false} />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] lg:min-h-[58vh] flex items-center pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 overflow-hidden bg-slate-950">
        {/* Immersive Background Video Wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: 1.0 }}
          />
          {/* Ambient Soft Dark Gradients - Clear & Bright */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/20" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mt-4 sm:mt-6 mb-6 sm:mb-8 leading-[1.15] sm:leading-[1.1] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] max-w-4xl mx-auto px-2"
          >
            <span className="block whitespace-nowrap">L'excellence technologique</span>
            <span className="block mt-1 sm:mt-2 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              à portée de main.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/95 mb-8 sm:mb-10 leading-relaxed px-4 py-3 sm:px-8 sm:py-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] font-sans font-medium tracking-wide"
          >
            Le CFP-ITMC forme les leaders de demain dans les métiers du numérique. 
            Apprenez, pratiquez et excellez avec les meilleurs experts de Douala.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-6"
          >
            <Button 
              size="lg" 
              onClick={() => scrollToSection('formations')}
              className="w-full sm:w-auto h-14 sm:h-16 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-base sm:text-lg font-bold shadow-xl shadow-blue-600/25 group cursor-pointer text-white"
            >
              Découvrir nos formations
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto p-3 sm:p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-[2rem] text-white"
          >
            {[
              { label: 'Spécialités DQP', val: '35' },
              { label: 'Pratique Terrain', val: '80%' },
              { label: 'Grandes Filières', val: '4' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="text-xl sm:text-4xl font-black mb-1">
                  <AnimatedCounter value={stat.val} className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-400" />
                </div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Magnificent 3-Layer Organic Curved Transition */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none">
          {/* Wave 1: Lueur Bleu Ciel Lumineux */}
          <svg
            viewBox="0 0 1440 120"
            className="relative block w-full h-20 sm:h-32 md:h-40 text-sky-300/50 fill-current translate-y-[8px]"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C360,130 720,10 1080,80 C1260,115 1380,70 1440,50 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 2: Vague Éclatante Bleu Vibrant */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-20 sm:h-32 md:h-40 text-blue-300/70 fill-current translate-y-[4px]"
            preserveAspectRatio="none"
          >
            <path d="M0,70 C380,140 700,20 1060,95 C1240,125 1360,85 1440,55 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 3: Main Foreground Solid Layer matching the slate-50 background below */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-20 sm:h-32 md:h-40 text-slate-50 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-100 relative" id="formations">
        <div className="container mx-auto px-0 xs:px-4 sm:px-6 max-w-7xl">
          
          {/* Section Heading & Introduction */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6 px-4 xs:px-0">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-1.5 mb-3 border border-blue-200/50">
                🎓 CADRE ACADÉMIQUE PROFESSIONNEL
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900 mt-1">
                Liste des Différentes Spécialités
              </h2>
              <p className="text-lg text-slate-600 mt-2 font-sans">
                Explorez notre répertoire de spécialisations professionnelles homologuées par l'État du Cameroun, classées par filières technologiques et managériales.
              </p>
            </div>
            
            <Button 
              onClick={() => setShowAllSpecialties(!showAllSpecialties)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-sans text-[10px] sm:text-xs tracking-wider uppercase font-extrabold rounded-xl h-auto py-3.5 sm:h-12 px-5 sm:px-6 gap-2 shadow-lg shadow-slate-950/20 cursor-pointer border border-slate-800 w-full sm:w-auto flex items-center justify-center"
            >
              <span className="hidden xs:inline">
                {showAllSpecialties ? "RÉDUIRE LA LISTE DES SPÉCIALITÉS" : "ACCÉDER AU REGISTRE COMPLET"}
              </span>
              <span className="inline xs:hidden">
                {showAllSpecialties ? "RÉDUIRE LA LISTE" : "VOIR TOUT LE REGISTRE"}
              </span>
              <ArrowRight className={`w-4 h-4 text-blue-400 transition-transform shrink-0 ${showAllSpecialties ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          {/* PHYSICAL ACADEMIC BINDER WRAPPER */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 rounded-none xs:rounded-2xl sm:rounded-[32px] p-0.5 xs:p-3 sm:p-4 md:p-8 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.4)] relative border-y xs:border border-slate-800/80 overflow-hidden">
            
            {/* Folder Cover Accent Details */}
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent z-10 pointer-events-none" />

            {/* Binder Spiral Rings (Only visible on lg screens for ultimate realism) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col justify-between h-[85%] z-30 pointer-events-none hidden lg:flex">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative flex items-center justify-center">
                  {/* Binder Hole on Paper Cover */}
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 shadow-inner absolute left-[22px]" />
                  {/* Binder Ring Arc */}
                  <div className="w-14 h-4 rounded-full border-t-[3px] border-b-[3px] border-l border-white/50 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 shadow-md transform -rotate-[15deg] absolute left-[-6px]" />
                </div>
              ))}
            </div>

            {/* Physical Labeled Folder Tabs (Intercalaires / Index Tabs) */}
            <div className="flex flex-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 mb-0 justify-start items-end w-full relative z-20 pl-2 lg:pl-16 pr-2 sm:pr-6 pt-2 pb-1 -mb-[1px]">
              <button
                onClick={() => setSelectedFiliere('all')}
                className={`relative px-3.5 sm:px-5 py-2.5 rounded-t-xl text-[10px] sm:text-xs font-display font-black transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-t border-x shrink-0 ${
                  selectedFiliere === 'all'
                    ? 'bg-[#fdfdfb] text-slate-900 border-slate-200 border-b-transparent translate-y-[1px] shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)] z-10'
                    : 'bg-slate-800/80 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Toutes ({specialties.length})</span>
              </button>
              {Object.entries(FILIERES).map(([key, f]) => {
                const count = specialties.filter(item => item.filiere.toLowerCase() === f.name.toLowerCase()).length;
                const isActive = selectedFiliere.toLowerCase() === f.name.toLowerCase();
                const tabColor = isActive 
                  ? 'bg-[#fdfdfb] text-blue-700 border-slate-200 border-b-transparent z-10 translate-y-[1px] shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]' 
                  : 'bg-slate-800/80 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200';
                
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFiliere(f.name)}
                    className={`relative px-3.5 sm:px-5 py-2.5 rounded-t-xl text-[10px] sm:text-xs font-display font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-t border-x shrink-0 ${tabColor}`}
                  >
                    {getFiliereIcon(f.id, "w-3.5 h-3.5")}
                    <span>
                      <span className="sm:hidden">
                        {f.id === 'batiment' && 'Bâtiment'}
                        {f.id === 'industrie' && 'Industrie'}
                        {f.id === 'informatique' && 'Informatique'}
                        {f.id === 'administration' && 'Gestion'}
                      </span>
                      <span className="hidden sm:inline">
                        {f.name.split(',')[0].split(' et ')[0]}
                      </span>
                      {' '}({count})
                    </span>
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* WHITE DOSSIER PAPER PAGE */}
            <div className="bg-[#fdfdfb] text-slate-800 rounded-xl xs:rounded-2xl p-3.5 xs:p-5 sm:p-8 md:p-12 relative border border-slate-200/80 shadow-2xl lg:ml-12 min-h-[500px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
              
              {/* Binder Paper Red Margin Line */}
              <div className="absolute left-[54px] top-0 bottom-0 w-[1.5px] bg-red-200/60 hidden lg:block pointer-events-none" />

              {/* Page Content Container (Padded slightly to respect the binder rings & margin) */}
              <div className="lg:pl-10 relative z-10">
                
                {/* Official Academic Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-slate-200/90 pb-5 mb-6 gap-4 w-full">
                  <div className="flex items-center gap-3.5">
                    {/* Institutional School Seal Crest */}
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full border-2 border-slate-900 flex items-center justify-center p-0.5 sm:p-1 bg-white shadow-md relative shrink-0">
                      <div className="w-full h-full rounded-full border border-dashed border-slate-900 flex flex-col items-center justify-center text-center">
                        <span className="text-[6px] sm:text-[7.5px] font-black leading-none text-slate-900 tracking-tighter">CFP-ITMC</span>
                        <span className="text-[4.5px] sm:text-[6px] font-bold text-slate-500 uppercase leading-none mt-0.5">DOUALA</span>
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-600 mt-0.5 flex items-center justify-center">
                          <span className="text-[3px] sm:text-[4.5px] text-white font-black">★</span>
                        </div>
                      </div>
                      {/* Authentic stamp ribbon graphic */}
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[6px] sm:text-[7.5px] px-1.5 py-0.5 rounded-md shadow-sm border border-amber-600/50 uppercase tracking-wider">
                        AGRÉÉ
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-[8px] sm:text-[9.5px] font-sans font-black tracking-widest text-slate-500 uppercase block leading-tight mb-0.5">
                        MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE (MINEFOP)
                      </span>
                      <h3 className="text-base sm:text-xl md:text-2xl font-display font-black text-slate-950 tracking-tight leading-snug">
                        Nos 35 Spécialités Professionnelles
                      </h3>
                      <p className="text-[9px] sm:text-[11px] text-blue-700 font-sans font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        80% Pratique en Atelier • Cours du Jour & du Soir • Inscriptions Ouvertes
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 self-start sm:self-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-full border border-slate-200 shadow-xs">
                      Session 2026/2027
                    </span>
                  </div>
                </div>

                {/* Specialties Display Grid of Syllabus Sheets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {(showAllSpecialties ? filteredSpecialties : filteredSpecialties.slice(0, 7)).map((item) => {
                    const filiereConfig = Object.values(FILIERES).find(f => f.name.toLowerCase() === item.filiere.toLowerCase()) || FILIERES.INFORMATIQUE;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -6, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => {
                          setActiveSpecialtyId(item.id);
                          setActiveImageIndex(0);
                        }}
                        className="bg-white rounded-xl border-2 border-slate-200/80 shadow-[2px_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_22px_45px_-10px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group relative"
                      >
                        {/* Decorative Certificate Frame Border */}
                        <div className="absolute inset-1.5 border border-dashed border-slate-100 pointer-events-none rounded-lg group-hover:border-slate-200/80 transition-colors" />

                        <div>
                          {/* Header Photo Block - Styled like an attached photograph */}
                          <div className="relative h-44 bg-slate-50 overflow-hidden p-3 pb-0">
                            <div className="w-full h-full rounded-lg overflow-hidden relative shadow-inner border border-slate-200/60 bg-white">
                              <img 
                                src={getOptimizedImageUrl(item.images[0], { width: 500, quality: 75 })} 
                                alt={item.name} 
                                loading="lazy"
                                decoding="async"
                                width="500"
                                height="280"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=75';
                                }}
                              />
                              
                              {/* Simulated Physical Paperclip Graphic */}
                              <div className="absolute -top-1.5 left-4 z-10 w-4 h-8 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full shadow-[1px_2px_3px_rgba(0,0,0,0.2)] flex items-center justify-center opacity-95">
                                <div className="w-2.5 h-6 rounded-full border border-slate-200/50 flex items-center justify-center">
                                  <div className="w-1.5 h-4 rounded-full border border-slate-400" />
                                </div>
                              </div>
                              
                              {/* Filiere Tag */}
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                <span className="bg-slate-900/90 text-[8px] font-black text-white px-2.5 py-1.5 rounded-sm uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-slate-700/50">
                                  {getFiliereIcon(filiereConfig.id, "w-3 h-3 text-blue-400")}
                                  <span>{item.filiere.split(',')[0]}</span>
                                </span>
                              </div>

                              <div className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-md text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1 z-10">
                                <ImageIcon className="w-2.5 h-2.5 text-blue-300" />
                                {item.images.length} Photos
                              </div>
                            </div>
                          </div>

                          {/* Body Area */}
                          <div className="p-4 pt-3.5 space-y-2 relative z-10">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-sans font-extrabold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm uppercase block border border-blue-100">
                                {item.subCategory}
                              </span>
                              <span className="text-[8px] font-sans text-slate-400 font-extrabold uppercase">
                                PROG-{item.id.slice(0, 6)}
                              </span>
                            </div>
                            
                            <h3 className="text-sm sm:text-base font-display font-black text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-blue-600 transition-colors" title={item.name}>
                              {item.name}
                            </h3>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{item.description}</p>
                          </div>
                        </div>

                        {/* Document Stats Card Footer */}
                        <div className="p-4 pt-0 mt-2 relative z-10">
                          {/* Official Syllabus Requirements Block */}
                          <div className="border-t border-b border-dashed border-slate-200 py-2.5 mb-3 space-y-2 text-[10px] font-sans text-slate-600 bg-slate-50/50 p-2 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1 font-bold text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" /> DURÉE &amp; RYTHME
                              </span>
                              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">{item.duration} • Jour/Soir</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1 font-bold text-slate-400">
                                <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> PÉDAGOGIE
                              </span>
                              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">80% Pratique</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1 font-bold text-slate-400">
                                <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" /> NIVEAU REQUIS
                              </span>
                              <span className="font-extrabold text-slate-800 text-[10px]">{item.levelRequired}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-slate-150">
                              <span className="flex items-center gap-1 font-bold text-slate-400">
                                <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" /> DIPLÔME VISÉ
                              </span>
                              <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-sans border border-blue-100">
                                DQP / CQP d'État
                              </span>
                            </div>
                          </div>

                          {/* Action Bookmark Stamp Button */}
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSpecialtyId(item.id);
                              setActiveImageIndex(0);
                            }}
                            className="w-full bg-slate-950 hover:bg-blue-600 text-white rounded-lg h-10 text-[10px] font-sans tracking-wider font-extrabold transition-all duration-300 gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-blue-500/10 border border-slate-800 hover:border-blue-500 flex items-center justify-center relative overflow-hidden group/btn"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center gap-1.5 uppercase text-white font-extrabold">
                              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
                              Consulter le Syllabus
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-transform duration-300 group-hover/btn:translate-x-1 relative z-10" />
                          </Button>

                          {/* Red Wax Seal Overlay on Hover */}
                          <div className="absolute bottom-2.5 right-4 pointer-events-none transform translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <div className="w-6 h-6 rounded-full bg-red-600 border border-red-700 shadow-md flex items-center justify-center text-[7px] text-white font-display font-black italic rotate-12 select-none">
                              ITMC
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Show full roster banner */}
                {filteredSpecialties.length > 7 && (
                  <div className="mt-14 text-center border-t border-dashed border-slate-200 pt-10 px-4">
                    {!showAllSpecialties ? (
                      <>
                        <p className="text-xs sm:text-sm text-slate-500 mb-4 font-sans font-black uppercase tracking-wider">
                          📋 Registre complet • {filteredSpecialties.length - 7} autres spécialités en attente de consultation
                        </p>
                        <Button 
                          onClick={() => setShowAllSpecialties(true)}
                          variant="outline" 
                          className="w-full sm:w-auto rounded-xl px-4 sm:px-8 py-3.5 h-auto sm:h-12 font-sans text-[10px] sm:text-xs font-black border-2 border-slate-300 text-slate-800 hover:bg-slate-50 gap-2 cursor-pointer shadow-sm flex items-center justify-center"
                        >
                          <span className="hidden xs:inline">AFFICHER TOUTES LES SPÉCIALITÉS ({filteredSpecialties.length} SPÉCIALITÉS)</span>
                          <span className="inline xs:hidden">VOIR LES {filteredSpecialties.length} SPÉCIALITÉS</span>
                          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => {
                          setShowAllSpecialties(false);
                          const element = document.getElementById('formations');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        variant="outline" 
                        className="w-full sm:w-auto rounded-xl px-4 sm:px-8 py-3.5 h-auto sm:h-12 font-sans text-[10px] sm:text-xs font-black border-2 border-slate-300 text-slate-800 hover:bg-slate-50 gap-2 cursor-pointer shadow-sm flex items-center justify-center"
                      >
                        <span>RÉDUIRE LA LISTE</span>
                        <ArrowRight className="w-4 h-4 text-blue-600 rotate-180 transition-transform shrink-0" />
                      </Button>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>


        {/* Magnificent 3-Layer Organic Curved Transition to Admission */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none">
          {/* Wave 1: Lueur Bleu Ciel Lumineux */}
          <svg
            viewBox="0 0 1440 120"
            className="relative block w-full h-20 sm:h-32 md:h-40 text-sky-300/50 fill-current translate-y-[8px]"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C360,130 720,10 1080,80 C1260,115 1380,70 1440,50 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 2: Vague Éclatante Bleu Vibrant */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-20 sm:h-32 md:h-40 text-blue-300/70 fill-current translate-y-[4px]"
            preserveAspectRatio="none"
          >
            <path d="M0,70 C380,140 700,20 1060,95 C1240,125 1360,85 1440,55 L1440,120 L0,120 Z" />
          </svg>
          
          {/* Wave 3: Main Foreground Solid Layer matching the white background of the Admission section below */}
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-20 sm:h-32 md:h-40 text-white fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,80 C400,150 680,30 1040,110 C1220,135 1340,90 1440,60 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Specialty Detailed Modal Backdrop & Body */}
      <SpecialtyDetailModal 
        specialty={activeSpecialty} 
        onClose={() => setActiveSpecialtyId(null)} 
      />

      {/* Admission Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50" id="admission">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-1.5 mb-4">
              <BookOpen className="w-4 h-4" /> Conditions &amp; Procédure d'Admission
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Rejoignez le CFP-ITMC en quelques étapes simples
            </h2>
            <p className="text-lg text-slate-500 mt-4 leading-relaxed">
              Consultez nos critères d'éligibilité et complétez votre dossier d'admission directement en ligne pour réserver votre place.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Admission criteria */}
            <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" /> Conditions d’admission
              </h3>
              
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  Être titulaire du <span className="text-blue-600 font-black">Baccalauréat</span> (ou du GCE Advanced Level pour le système anglophone), d'un <span className="text-blue-600 font-black">Probatoire</span> ou d'un <span className="text-blue-600 font-black">BEPC</span>.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Documents requis pour l’inscription :</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Scan Original du dernier diplôme obtenu', desc: 'Bac, BEPC, Probatoire ou équivalent' },
                    { label: 'Scan original de votre Acte de Naissance', desc: 'Document lisible' },
                    { label: 'Certificat médical de bonne santé', desc: 'Délivré par un médecin agréé' },
                    { label: 'Photocopie de la Carte Nationale d’Identité', desc: 'Ou passeport en cours de validité' },
                  ].map((doc, i) => (
                    <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 text-xs font-black text-blue-600 flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Registration process summary */}
            <div className="lg:col-span-7 bg-slate-900 text-white p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[480px]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" /> Pré-inscription en ligne 2026
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  La première étape est entièrement gratuite ! Remplissez le formulaire en ligne, téléversez vos documents et sélectionnez vos horaires de cours (Cours du Jour ou du Soir).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { step: '01', title: 'Créer votre dossier', desc: 'Saisissez vos coordonnées de contact (nom, prénom, numéro).' },
                    { step: '02', title: 'Choisir la formation', desc: 'Sélectionnez la filière d’études et la session horaire préférée (matin/soir).' },
                    { step: '03', title: 'Dépôt des pièces', desc: 'Glissez-déposez vos scans requis en quelques secondes.' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2.5 relative">
                      <div className="text-3xl font-black text-blue-500/80">{item.step}</div>
                      <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Frais de pré-inscription offerts
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    * Les frais d’études ne seront payés qu’une fois votre candidature validée par l'administration.
                  </p>
                </div>
                
                <Button 
                  onClick={() => handleOpenRegistration()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-8 font-black shadow-xl shadow-blue-600/25 shrink-0 text-sm gap-2 cursor-pointer"
                >
                  Démarrer ma pré-inscription
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistrationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegistrationModalOpen(false)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10 text-left flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-black text-base xs:text-lg sm:text-xl text-slate-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0" /> Portail de Pré-inscription
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">CFP-ITMC Douala - Logpom, Face Pharmacie</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsRegistrationModalOpen(false)}
                  className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Steps Indicators */}
              <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between gap-4">
                {[
                  { step: 1, title: 'Compte', desc: 'Infos persos' },
                  { step: 2, title: 'Filière', desc: 'Choix & horaires' },
                  { step: 3, title: 'Dossier', desc: 'Téléversements' },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                      regStep === s.step 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50/50" 
                        : regStep > s.step 
                          ? "bg-green-500 text-white animate-fade-in" 
                          : "bg-slate-100 text-slate-400"
                    )}>
                      {regStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <div className="hidden xs:block">
                      <p className="text-xs font-bold text-slate-800">{s.title}</p>
                      <p className="text-[10px] text-slate-400 leading-none">{s.desc}</p>
                    </div>
                    {s.step < 3 && <div className="hidden md:block w-12 h-0.5 bg-slate-100" />}
                  </div>
                ))}
              </div>

              {/* Error Alert */}
              {regError && (
                <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-bold leading-relaxed">{regError}</span>
                </div>
              )}

              {/* Form Content / Scroll area */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[60vh] custom-scrollbar">
                {regSuccess ? (
                  /* Success State */
                  <div className="text-center py-8 px-4 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner shadow-emerald-200">
                      <Check className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-900">Pré-inscription Soumise !</h4>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        Félicitations <span className="font-bold text-slate-900">{regFormData.firstName} {regFormData.lastName}</span>, votre dossier de candidature a bien été envoyé à la direction du CFP-ITMC.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 text-left space-y-3 text-xs">
                      <p className="font-bold text-slate-700 text-center border-b border-slate-100 pb-2">Récapitulatif d'inscription</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block font-medium">Spécialité choisie :</span>
                          <span className="font-black text-slate-800">
                            {specialties.find(s => s.id === regFormData.specialtyId)?.name || 'Formation'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Session :</span>
                          <span className="font-black text-slate-800">
                            {regFormData.timeSlot === 'morning' ? 'Matin (8h - 14h)' : 'Soir (16h - 22h)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Téléphone :</span>
                          <span className="font-black text-slate-800">{regFormData.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Documents joints :</span>
                          <span className="font-black text-emerald-600">3 scans obligatoires transmis</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl text-xs font-bold leading-relaxed">
                      * Aucun frais ne vous est demandé à cette étape. Nos agents vont étudier vos scans. Vous recevrez un appel de confirmation et un SMS dès acceptation !
                    </div>

                    <div className="pt-4 flex justify-center gap-3">
                      <Link to="/dashboard">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-bold">
                          Aller à l'espace étudiant
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsRegistrationModalOpen(false)}
                        className="rounded-xl h-11 border-slate-200 text-slate-700 font-bold"
                      >
                        Fermer la fenêtre
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Active Steps Form */
                  <div className="space-y-6">
                    {regStep === 1 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30 text-xs text-blue-900 leading-relaxed font-bold">
                          Bienvenue sur la plateforme de pré-inscription ! Veuillez saisir vos coordonnées de contact pour créer votre dossier de candidat.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">Prénom <span className="text-rose-500">*</span></label>
                            <input 
                              type="text" 
                              required
                              value={regFormData.firstName}
                              onChange={e => setRegFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Ex: Jean Paul" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">Nom de famille <span className="text-rose-500">*</span></label>
                            <input 
                              type="text" 
                              required
                              value={regFormData.lastName}
                              onChange={e => setRegFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Ex: Kamdem" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-700">Numéro de Téléphone <span className="text-rose-500">*</span></label>
                          <input 
                            type="tel" 
                            required
                            value={regFormData.phone}
                            onChange={e => setRegFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Ex: +237 683 66 32 22" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-700">Adresse E-mail (optionnelle)</label>
                          <input 
                            type="email" 
                            value={regFormData.email}
                            onChange={e => setRegFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Ex: jean.kamdem@gmail.com" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {regStep === 2 && (
                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-700">Spécialité souhaitée <span className="text-rose-500">*</span></label>
                          <ModernSelect 
                            required
                            dropdownTitle="Spécialité souhaitée"
                            value={regFormData.specialtyId}
                            onChange={e => setRegFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-blue-500/20 outline-none font-bold"
                          >
                            <option value="">🎓 Sélectionnez une spécialité...</option>
                            {specialties.map(s => (
                              <option key={s.id} value={s.id}>
                                🎓 {s.name} — {s.filiere.split(',')[0]} ({s.levelRequired || 'Bac'})
                              </option>
                            ))}
                          </ModernSelect>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-700">Session horaire souhaitée <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                              onClick={() => setRegFormData(prev => ({ ...prev, timeSlot: 'morning' }))}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 text-left",
                                regFormData.timeSlot === 'morning' 
                                  ? "border-blue-600 bg-blue-50/20 text-slate-900" 
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black">Cours du Jour</span>
                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", regFormData.timeSlot === 'morning' ? "border-blue-600" : "border-slate-300")}>
                                  {regFormData.timeSlot === 'morning' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-500">Horaires : 08h30 - 13h30 (80% Pratique)</span>
                            </div>

                            <div 
                              onClick={() => setRegFormData(prev => ({ ...prev, timeSlot: 'evening' }))}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 text-left",
                                regFormData.timeSlot === 'evening' 
                                  ? "border-blue-600 bg-blue-50/20 text-slate-900" 
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black">Cours du Soir</span>
                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", regFormData.timeSlot === 'evening' ? "border-blue-600" : "border-slate-300")}>
                                  {regFormData.timeSlot === 'evening' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-500">Horaires : 17h30 - 20h30 (Professionnels)</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 leading-relaxed font-bold">
                          ⚠️ Remarque : Les frais de pré-inscription et d’études ne seront payés qu'une fois votre candidature administrative formellement acceptée par notre jury d'admission.
                        </div>
                      </div>
                    )}

                    {regStep === 3 && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 font-bold leading-relaxed flex items-center justify-between gap-3">
                          <span>💡 <strong>Étape Optionnelle :</strong> L'envoi des diplômes et justificatifs n'est pas obligatoire pour soumettre votre pré-inscription. Vous pouvez joindre vos pièces maintenant ou finaliser directement.</span>
                        </div>

                        {/* Document grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { key: 'diploma', label: 'Dernier diplôme obtenu (Optionnel)', desc: 'Scan du Bac ou BEPC (facultatif)' },
                            { key: 'birthCertificate', label: 'Acte de naissance (Optionnel)', desc: 'Scan de votre acte (facultatif)' },
                            { key: 'medicalCertificate', label: 'Certificat médical (Optionnel)', desc: 'Certificat de bonne santé (facultatif)' },
                            { key: 'cni', label: 'Photocopie CNI (Optionnel)', desc: 'Carte nationale d’identité (facultatif)' },
                          ].map((doc) => {
                            const field = doc.key as 'diploma' | 'birthCertificate' | 'medicalCertificate' | 'cni';
                            const hasFile = regFiles[field];
                            const progress = uploadProgress[field];
                            const isUploading = progress !== undefined && progress < 100;
                            
                            return (
                              <div key={doc.key} className="space-y-1.5">
                                <label className="text-xs font-black text-slate-700">{doc.label}</label>
                                
                                <div 
                                  onDragOver={e => e.preventDefault()}
                                  onDrop={e => handleFileDrop(field, e)}
                                  onClick={() => {
                                    const input = document.getElementById(`file-input-${doc.key}`);
                                    if (input) input.click();
                                  }}
                                  className={cn(
                                    "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 h-36",
                                    hasFile 
                                      ? "border-green-500 bg-green-50/10" 
                                      : isUploading 
                                        ? "border-blue-400 bg-blue-50/5" 
                                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                                  )}
                                >
                                  <input 
                                    type="file" 
                                    id={`file-input-${doc.key}`}
                                    className="hidden"
                                    onChange={e => handleFileChange(field, e.target.files ? e.target.files[0] : null)}
                                    accept="image/*,application/pdf"
                                  />
                                  
                                  {hasFile ? (
                                    <>
                                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <p className="text-xs font-black text-slate-800 line-clamp-1 max-w-[150px]">{hasFile.name}</p>
                                      <span className="text-[10px] text-green-600 font-extrabold uppercase">Téléversé</span>
                                    </>
                                  ) : isUploading ? (
                                    <>
                                      <div className="w-full px-4 space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold text-blue-600">
                                          <span>Chargement...</span>
                                          <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                          <div className="bg-blue-600 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5 text-slate-400" />
                                      <div>
                                        <p className="text-[11px] font-extrabold text-slate-800">Glisser-déposer ou cliquer</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">{doc.desc}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer navigation */}
              {!regSuccess && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <Button
                    type="button"
                    disabled={regStep === 1}
                    onClick={() => setRegStep(prev => prev - 1)}
                    variant="outline"
                    className="rounded-xl font-bold h-11 border-slate-200 text-slate-700 disabled:opacity-50"
                  >
                    Précédent
                  </Button>

                  {regStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        // Check validation per step
                        if (regStep === 1) {
                          if (!regFormData.firstName || !regFormData.lastName || !regFormData.phone) {
                            setRegError('Veuillez remplir toutes les informations obligatoires.');
                            return;
                          }
                        } else if (regStep === 2) {
                          if (!regFormData.specialtyId) {
                            setRegError('Veuillez sélectionner la spécialité souhaitée.');
                            return;
                          }
                        }
                        setRegError('');
                        setRegStep(prev => prev + 1);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-extrabold px-6"
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRegistrationSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-black px-8 shadow-lg shadow-green-500/10 min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Traitement...
                        </div>
                      ) : (
                        "Soumettre mon dossier"
                      )}
                    </Button>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Latest News & Events Preview Section */}
      <section id="actualites" className="py-20 bg-slate-50 border-t border-slate-200/60 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full text-blue-700 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Journal &amp; Agenda de l'Institut
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Dernières Actualités &amp; Événements
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
                Restez informés des dates d'examens d'État DQP, des rentrées académiques, des hackathons et des partenariats du CFP-ITMC.
              </p>
            </div>

            <Link to="/actualites">
              <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-extrabold h-11 px-5 gap-2 transition-colors cursor-pointer shadow-md">
                <span>Consulter toutes nos actualités</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {recentNews.map((item) => (
              <Link 
                key={item.id} 
                to={`/actualites?id=${item.id}`}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img 
                      src={getOptimizedImageUrl(item.coverImage, { width: 600, quality: 75 })} 
                      alt={item.title} 
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="340"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-white/95 backdrop-blur-sm text-slate-900 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.publishedAt}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                  <span className="text-[11px] font-bold text-slate-400">{item.readTime}</span>
                  <span className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Lire <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-16 sm:py-20 lg:py-24 overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-10" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-slate-900 h-64 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src={industrieBanner} 
                      className="w-full h-full object-cover opacity-90" 
                      alt="Étudiants en atelier pratique ITMC" 
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="320"
                    />
                  </div>
                  <div className="bg-blue-600 min-h-[12rem] h-auto rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center shadow-xl">
                    <div className="text-4xl sm:text-5xl font-black mb-2">
                      <AnimatedCounter value="80%" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-85">Pratique en Atelier</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-200 h-48 rounded-3xl overflow-hidden shadow-md">
                     <img 
                       src={informatiqueBanner} 
                       className="w-full h-full object-cover" 
                       alt="Salle informatique et laboratoire multimédia ITMC" 
                       loading="lazy"
                       decoding="async"
                       width="400"
                       height="240"
                     />
                  </div>
                  <div className="bg-white border-2 border-slate-100 min-h-[16rem] h-auto rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-center">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 mb-2">Diplôme Agréé</div>
                    <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">Nos certifications sont reconnues par l'État et les entreprises internationales.</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-8">Pourquoi choisir le CFP-ITMC ?</h2>
              <div className="space-y-8">
                {[
                  { title: 'Équipements de pointe', desc: 'Salles climatisées, ordinateurs de dernière génération et connexion fibre optique.' },
                  { title: 'Experts formateurs', desc: 'Des professionnels en activité qui partagent leur savoir-faire réel du terrain.' },
                  { title: 'Accompagnement carrière', desc: 'Aide à la rédaction de CV, préparation aux entretiens et réseau de stages.' },
                  { title: 'Flexibilité horaire', desc: 'Cours du jour, du soir et sessions intensives le week-end.' },
                ].map((item, i) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => handleOpenRegistration()}
                className="mt-12 h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xl shadow-blue-500/20 cursor-pointer"
              >
                S'inscrire maintenant
              </Button>
            </div>
          </div>
        </div>

      </section>

      {/* Footer */}
      <PublicFooter showWaveTransition={true} />
    </div>
  );
}
