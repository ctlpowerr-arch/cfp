import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Building2, 
  ExternalLink, 
  Inbox,
  CheckCheck,
  Megaphone,
  MessageSquarePlus,
  Info,
  CalendarCheck,
  Search,
  Filter,
  Trash2,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Flame
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

import { gameAudio } from '@/lib/gameAudio';

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  sender?: string;
  senderRole?: 'admin' | 'teacher' | 'student';
  type?: string;
  target?: string;
  targetStudents?: string[];
  priority?: 'urgent' | 'high' | 'normal';
  date: string;
  readBy?: string[];
  actionUrl?: string;
  teacherId?: string;
  teacherEmail?: string;
}

interface AdminNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: any;
  onUnreadCountChange?: (count: number) => void;
}

export default function AdminNotificationDrawer({
  isOpen,
  onClose,
  adminUser,
  onUnreadCountChange
}: AdminNotificationDrawerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all_notifications' | 'teacher_requests' | 'new_broadcast'>('all_notifications');
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // 'all' | 'teachers' | 'students'
  const [broadcastType, setBroadcastType] = useState('Annonce Officielle');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActionUrl, setBroadcastActionUrl] = useState('');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data: AdminNotificationItem[] = await res.json();
        setNotifications(data);
        const readerId = adminUser?.id || adminUser?.email || 'admin';
        const unread = data.filter(n => !(Array.isArray(n.readBy) && n.readBy.includes(readerId))).length;
        if (onUnreadCountChange) {
          onUnreadCountChange(unread);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications for admin", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const readerId = adminUser?.id || adminUser?.email || 'admin';

  const markAsRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId })
      });
      setNotifications(prev => prev.map(n => {
        if (n.id === notifId) {
          const reads = n.readBy || [];
          return { ...n, readBy: reads.includes(readerId) ? reads : [...reads, readerId] };
        }
        return n;
      }));
      const updated = notifications.map(n => n.id === notifId ? { ...n, readBy: [...(n.readBy || []), readerId] } : n);
      const count = updated.filter(n => !(n.readBy?.includes(readerId))).length;
      if (onUnreadCountChange) onUnreadCountChange(count);
      window.dispatchEvent(new CustomEvent('notification_sent'));
      toast.success("Notification marquée comme lue.");
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId })
      });
      setNotifications(prev => prev.map(n => {
        const readBy = Array.isArray(n.readBy) 
          ? (n.readBy.includes(readerId) ? n.readBy : [...n.readBy, readerId])
          : [readerId];
        return { ...n, readBy };
      }));
      if (onUnreadCountChange) onUnreadCountChange(0);
      window.dispatchEvent(new CustomEvent('notification_sent'));
      toast.success("Toutes les notifications ont été marquées comme lues !");
    } catch (err) {
      toast.error("Échec de mise à jour");
    }
  };

  const handleDeleteNotif = async (notifId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notifId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        window.dispatchEvent(new CustomEvent('notification_sent'));
        toast.success("Notification supprimée.");
      }
    } catch (err) {
      toast.error("Erreur de suppression.");
    }
  };

  const applyBroadcastPreset = (presetKey: 'emargement' | 'examen' | 'scolarite' | 'planning') => {
    try { gameAudio.notify(); } catch (e) {}
    if (presetKey === 'emargement') {
      setBroadcastTitle('Rappel Émargement Hebdomadaire & Fiches de Séances');
      setBroadcastTarget('teachers');
      setBroadcastType('Rappel Émargement');
      setBroadcastPriority('high');
      setBroadcastActionUrl('/dashboard/attendance');
      setBroadcastMessage('Chers Formateurs, nous vous rappelons de procéder à la clôture et validation numérique de vos fiches d’émargement pour toutes les séances dispensées cette semaine avant vendredi 17h00. Merci pour votre rigueur.');
    } else if (presetKey === 'examen') {
      setBroadcastTitle('Avis Officiel - Organisation des Évaluations Continues (DQP)');
      setBroadcastTarget('all');
      setBroadcastType('Alerte Examen');
      setBroadcastPriority('urgent');
      setBroadcastActionUrl('/dashboard/grades');
      setBroadcastMessage('Information importante aux Formateurs et Apprenants : La session d’évaluation continue du semestre se tiendra du 15 au 20 de ce mois. Veuillez consulter les plannings et grilles d’évaluation sur vos comptes.');
    } else if (presetKey === 'scolarite') {
      setBroadcastTitle('Rappel de Recouvrement - Échéance 2ème Tranche de Scolarité');
      setBroadcastTarget('students');
      setBroadcastType('Rappel Pension');
      setBroadcastPriority('urgent');
      setBroadcastActionUrl('/dashboard/treasury');
      setBroadcastMessage('Chers Apprenants, la date limite pour le versement de la 2ème tranche de scolarité approche. Les reçus numériques sont exigés pour l’accès aux laboratoires et salles d’examens. Merci de régulariser à la Caisse.');
    } else if (presetKey === 'planning') {
      setBroadcastTitle('Mise à jour des Emplois du Temps & Assignations de Salles');
      setBroadcastTarget('all');
      setBroadcastType('Changement Planning');
      setBroadcastPriority('normal');
      setBroadcastActionUrl('/dashboard/schedule');
      setBroadcastMessage('Une mise à jour des salles et horaires de cours est effective pour la semaine en cours. Merci de consulter l’emploi du temps dynamique.');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Veuillez renseigner le titre et le contenu du message.");
      return;
    }

    setIsSubmittingBroadcast(true);
    try {
      const payload = {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        sender: adminUser?.name || "Administration Générale",
        senderRole: 'admin',
        type: broadcastType,
        target: broadcastTarget,
        priority: broadcastPriority,
        actionUrl: broadcastActionUrl.trim() || undefined
      };

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        try { gameAudio.notify(); } catch (e) {}
        window.dispatchEvent(new CustomEvent('notification_sent'));
        toast.success("Message diffusé en direct avec succès !");
        setBroadcastTitle('');
        setBroadcastMessage('');
        setBroadcastActionUrl('');
        setActiveTab('all_notifications');
        fetchNotifications();
      } else {
        toast.error("Échec d'envoi du message.");
      }
    } catch (err) {
      toast.error("Erreur de communication avec le serveur.");
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  // Filter computations
  const isReadByAdmin = (n: AdminNotificationItem) => Array.isArray(n.readBy) && n.readBy.includes(readerId);
  const unreadCount = notifications.filter(n => !isReadByAdmin(n)).length;

  const teacherRequests = notifications.filter(n => n.senderRole === 'teacher' || n.target === 'admin');

  const filteredNotifications = notifications.filter(n => {
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      const matchSender = (n.sender || '').toLowerCase().includes(q);
      return matchTitle || matchMsg || matchSender;
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
          />

          {/* Slide-over panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-[80] flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Centre de Notifications & Diffusion
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Super Administration • Communication Directe
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('all_notifications')}
                className={cn(
                  "flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                  activeTab === 'all_notifications' 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Récents ({notifications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('teacher_requests')}
                className={cn(
                  "flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                  activeTab === 'teacher_requests' 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Requêtes ({teacherRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('new_broadcast')}
                className={cn(
                  "flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                  activeTab === 'new_broadcast' 
                    ? "bg-blue-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Diffuser</span>
              </button>
            </div>

            {/* TAB 1: ALL NOTIFICATIONS FEED */}
            {activeTab === 'all_notifications' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Search & Action Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="Filtrer les messages..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  {unreadCount > 0 && (
                    <Button
                      onClick={markAllAsRead}
                      variant="outline"
                      size="sm"
                      className="h-9 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Tout lire
                    </Button>
                  )}
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">Aucune notification pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notif) => {
                      const isRead = isReadByAdmin(notif);
                      const isTeacher = notif.senderRole === 'teacher';

                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all relative space-y-2",
                            !isRead 
                              ? "bg-blue-50/70 border-blue-200/80 dark:bg-blue-950/30 dark:border-blue-900/50" 
                              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className={cn(
                                "font-black text-[9px] uppercase px-2 py-0.5 border-none",
                                isTeacher ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" : "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300"
                              )}>
                                {notif.type || (isTeacher ? 'Requête Formateur' : 'Annonce')}
                              </Badge>
                              {notif.priority === 'urgent' && (
                                <Badge className="bg-red-500 text-white font-black text-[9px] uppercase flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" /> URGENT
                                </Badge>
                              )}
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {new Date(notif.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{notif.title}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">
                              {notif.message}
                            </p>
                            {notif.sender && (
                              <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                                <span>Expéditeur :</span>
                                <span className="text-slate-700 dark:text-slate-300 font-black">{notif.sender}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                            {notif.actionUrl ? (
                              <button
                                onClick={() => {
                                  markAsRead(notif.id);
                                  onClose();
                                  navigate(notif.actionUrl!);
                                }}
                                className="text-blue-600 hover:underline font-black flex items-center gap-1 cursor-pointer"
                              >
                                Accéder à la page <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : <span />}

                            <div className="flex items-center gap-2">
                              {!isRead && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="text-emerald-600 hover:underline font-bold cursor-pointer"
                                >
                                  Marquer comme lu
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotif(notif.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TEACHER REQUESTS */}
            {activeTab === 'teacher_requests' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {teacherRequests.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <p className="text-xs font-bold text-slate-400">Aucune requête en attente de la part des formateurs.</p>
                  </div>
                ) : (
                  teacherRequests.map(req => (
                    <div key={req.id} className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-amber-500 text-slate-950 font-black text-[9px]">
                          Formateur : {req.sender || 'Formateur DQP'}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {new Date(req.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{req.title}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{req.message}</p>
                      <div className="pt-2 flex justify-end">
                        <Button
                          onClick={() => {
                            toast.success(`Réponse initiée pour ${req.sender}`);
                            setActiveTab('new_broadcast');
                            setBroadcastTitle(`RÉ: ${req.title}`);
                          }}
                          size="sm"
                          className="h-8 text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white rounded-xl"
                        >
                          Répondre au Formateur
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: NEW BROADCAST ANNOUNCEMENT */}
            {activeTab === 'new_broadcast' && (
              <form onSubmit={handleSendBroadcast} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-900 dark:text-blue-300 block">📢 Diffusion Directe ITMC</span>
                    <Badge className="bg-blue-600 text-white font-black text-[9px]">En Direct</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Diffusez une annonce ou une alerte officielle sur le tableau de bord des enseignants et apprenants.
                  </p>

                  {/* Modèles Préconfigurés */}
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 block">Modèles Rapides Prêts à l'Emploi :</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyBroadcastPreset('emargement')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                      >
                        <CalendarCheck className="w-3 h-3 text-amber-500" />
                        Rappel Émargement
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBroadcastPreset('examen')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3 text-red-500" />
                        Alerte Examen DQP
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBroadcastPreset('scolarite')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        Relance Caisse / Pension
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBroadcastPreset('planning')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                      >
                        <Info className="w-3 h-3 text-blue-500" />
                        Mise à Jour Emploi du Temps
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Public Cible</label>
                  <ModernSelect
                    value={broadcastTarget}
                    onChange={e => setBroadcastTarget(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="all">Tous les Utilisateurs (Formateurs + Apprenants)</option>
                    <option value="teachers">Corps Enseignant Uniquement</option>
                    <option value="students">Tous les Étudiants / Apprenants</option>
                  </ModernSelect>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Titre de l'Annonce</label>
                  <Input
                    placeholder="Ex: Convocation aux Évaluations / Maintien des Cours"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="h-10 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Catégorie</label>
                    <ModernSelect
                      value={broadcastType}
                      onChange={e => setBroadcastType(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="Annonce Officielle">Annonce Officielle</option>
                      <option value="Alerte Examen">Alerte Examen / Compos</option>
                      <option value="Rappel Pension">Rappel Pension / Caisse</option>
                      <option value="Changement Planning">Changement Planning</option>
                      <option value="Événement">Événement & Vie du Centre</option>
                    </ModernSelect>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Niveau de Priorité</label>
                    <ModernSelect
                      value={broadcastPriority}
                      onChange={e => setBroadcastPriority(e.target.value as any)}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="normal">Normale</option>
                      <option value="high">Haute / Importante</option>
                      <option value="urgent">🚨 Urgente / Prioritaire</option>
                    </ModernSelect>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Lien d'Action (Optionnel)</label>
                  <Input
                    placeholder="Ex: /dashboard/schedule ou /student/grades"
                    value={broadcastActionUrl}
                    onChange={e => setBroadcastActionUrl(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Message / Contenu Officiel</label>
                  <textarea
                    rows={5}
                    placeholder="Rédigez ici les détails de la communication officielle..."
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingBroadcast}
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingBroadcast ? "Diffusion en cours..." : "Diffuser le Message Officiel"}
                </Button>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
