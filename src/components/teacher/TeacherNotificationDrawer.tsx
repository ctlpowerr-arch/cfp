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
  CalendarCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ModernSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { gameAudio } from "@/lib/gameAudio";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  sender: string;
  senderRole: 'admin' | 'teacher';
  type: string;
  target: string;
  priority: 'urgent' | 'high' | 'normal';
  date: string;
  readBy?: string[];
  actionUrl?: string;
}

interface TeacherNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any;
  onUnreadCountChange?: (count: number) => void;
}

export default function TeacherNotificationDrawer({
  isOpen,
  onClose,
  teacher,
  onUnreadCountChange
}: TeacherNotificationDrawerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'announcements' | 'my_requests' | 'new_request'>('announcements');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // New Request Form
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('demande_materiel');
  const [reqPriority, setReqPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [reqMessage, setReqMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?teacherId=${teacher.id}`);
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
        const unread = data.filter(n => 
          n.senderRole === 'admin' && !(Array.isArray(n.readBy) && n.readBy.includes(teacher.id))
        ).length;
        if (onUnreadCountChange) {
          onUnreadCountChange(unread);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, teacher]);

  const markAsRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId: teacher.id })
      });
      setNotifications(prev => prev.map(n => {
        if (n.id === notifId) {
          const reads = n.readBy || [];
          return { ...n, readBy: reads.includes(teacher.id) ? reads : [...reads, teacher.id] };
        }
        return n;
      }));
      // Recalculate unread count
      const updated = notifications.map(n => n.id === notifId ? { ...n, readBy: [...(n.readBy || []), teacher.id] } : n);
      const count = updated.filter(n => n.senderRole === 'admin' && !(n.readBy?.includes(teacher.id))).length;
      if (onUnreadCountChange) onUnreadCountChange(count);
      window.dispatchEvent(new CustomEvent('notification_sent'));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadList = notifications.filter(n => n.senderRole === 'admin' && !(n.readBy?.includes(teacher.id)));
      await Promise.all(unreadList.map(n => 
        fetch(`/api/notifications/${n.id}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerId: teacher.id })
        })
      ));
      window.dispatchEvent(new CustomEvent('notification_sent'));
      toast.success("Toutes les notifications ont été marquées comme lues");
      fetchNotifications();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const applyTeacherPreset = (presetKey: 'materiel' | 'absence' | 'recours' | 'salle') => {
    try { gameAudio.notify(); } catch (e) {}
    if (presetKey === 'materiel') {
      setReqTitle('Demande de Matériel Informatique & Connectique pour TP');
      setReqType('demande_materiel');
      setReqPriority('high');
      setReqMessage(`Bonjour la Direction, nous sollicitons des câbles réseau RJ45, des multiprises et du matériel d’expérimentation supplémentaire pour les prochains TP informatiques. Merci.`);
    } else if (presetKey === 'absence') {
      setReqTitle('Signalement de Déplacement / Absence Justifiée & Rattrapage');
      setReqType('absence_teacher');
      setReqPriority('normal');
      setReqMessage(`Chère Direction, en raison d’un impératif professionnel / médical, je sollicite un décalage de ma séance de cours du [Saisir la date]. Une séance de rattrapage sera programmée.`);
    } else if (presetKey === 'recours') {
      setReqTitle('Demande de Rectification / Validation de Note de CC');
      setReqType('recours_note');
      setReqPriority('normal');
      setReqMessage(`Je demande la réouverture exceptionnelle du bordereau de saisie des notes pour le cours [Saisir le module] afin de corriger une coquille d'anonymat.`);
    } else if (presetKey === 'salle') {
      setReqTitle('Demande de Changement Exceptionnel de Salle ou Projecteur');
      setReqType('demande_salle');
      setReqPriority('normal');
      setReqMessage(`Le cours nécessite un vidéoprojecteur fonctionnel et des postes informatiques équipés de logiciels spécialisés. Merci d'attribuer le Labo Info 2 pour la séance.`);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqMessage.trim()) {
      toast.error("Veuillez renseigner le titre et le contenu de votre message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: reqTitle,
        message: reqMessage,
        sender: teacher.name,
        senderRole: 'teacher',
        type: reqType,
        target: 'admin',
        priority: reqPriority,
        teacherId: teacher.id,
        teacherEmail: teacher.email
      };

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        try { gameAudio.notify(); } catch (e) {}
        window.dispatchEvent(new CustomEvent('notification_sent'));
        toast.success("Votre requête a été transmise directement à l'Administration ITMC !");
        setReqTitle('');
        setReqMessage('');
        setActiveTab('my_requests');
        fetchNotifications();
      } else {
        toast.error("Erreur lors de l'envoi de la requête");
      }
    } catch (err) {
      toast.error("Échec de communication avec le serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const adminAnnouncements = notifications.filter(n => n.senderRole === 'admin');
  const myRequests = notifications.filter(n => n.senderRole === 'teacher' && n.sender === teacher.name);
  const unreadCount = adminAnnouncements.filter(n => !(n.readBy?.includes(teacher.id))).length;

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
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Centre de Communication
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Liaison directe Administration ⇄ {teacher.name}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('announcements')}
                className={cn(
                  "flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'announcements' 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                <span>Annonces ({adminAnnouncements.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('my_requests')}
                className={cn(
                  "flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'my_requests' 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                <Inbox className="w-3.5 h-3.5 shrink-0" />
                <span>Mes Requêtes ({myRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('new_request')}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                  activeTab === 'new_request' 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                )}
              >
                <MessageSquarePlus className="w-3.5 h-3.5 shrink-0" />
                <span>+ Écrire</span>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* TAB 1: Admin Announcements */}
              {activeTab === 'announcements' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Circulaires & Directives
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead} 
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {adminAnnouncements.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-medium">Aucune annonce administrative pour le moment.</p>
                    </div>
                  ) : (
                    adminAnnouncements.map((notif) => {
                      const isRead = notif.readBy?.includes(teacher.id);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-2xl border transition-all relative overflow-hidden",
                            isRead 
                              ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80" 
                              : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm"
                          )}
                        >
                          {!isRead && (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600" />
                          )}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] font-black uppercase px-2 py-0.5",
                                  notif.priority === 'urgent' ? "bg-red-100 text-red-700 border-red-200" :
                                  notif.priority === 'high' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                  "bg-blue-100 text-blue-700 border-blue-200"
                                )}
                              >
                                {notif.priority === 'urgent' ? 'Urgent' : notif.priority === 'high' ? 'Important' : 'Général'}
                              </Badge>
                              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!isRead && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                              >
                                Marquer lu
                              </button>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <span className="font-semibold text-slate-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {notif.sender}
                            </span>
                            {notif.actionUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  markAsRead(notif.id);
                                  onClose();
                                  navigate(notif.actionUrl!);
                                }}
                                className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700 p-0 hover:bg-transparent"
                              >
                                Consulter <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: My Sent Requests */}
              {activeTab === 'my_requests' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Vos requêtes soumises à la direction
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab('new_request')}
                      className="h-7 text-xs font-bold rounded-lg"
                    >
                      + Nouveau
                    </Button>
                  </div>

                  {myRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-medium">Vous n'avez envoyé aucune requête pour le moment.</p>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('new_request')} 
                        className="mt-3 bg-blue-600 text-white rounded-xl text-xs font-bold"
                      >
                        Transmettre une demande
                      </Button>
                    </div>
                  ) : (
                    myRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 text-slate-600">
                            {req.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(req.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          {req.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {req.message}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-emerald-600 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Transmis à la Direction
                          </span>
                          <span className="text-slate-400 font-normal">Destinataire : Administration ITMC</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: New Request Form */}
              {activeTab === 'new_request' && (
                <form onSubmit={handleSubmitRequest} className="space-y-4 p-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Ce formulaire transmet votre requête directement au secrétariat académique et à la direction pédagogique.
                      </span>
                    </div>

                    {/* Modèles Préconfigurés */}
                    <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 block">Modèles Rapides de Requêtes :</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyTeacherPreset('materiel')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                        >
                          📦 Matériel TP / Câbles
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTeacherPreset('absence')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                        >
                          🚗 Absence / Déplacement
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTeacherPreset('recours')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                        >
                          📝 Rectification Note
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTeacherPreset('salle')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                        >
                          🏫 Changement de Salle
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Type de Requête
                    </label>
                    <ModernSelect 
                      dropdownTitle="Type de Requête"
                      value={reqType} 
                      onChange={(e) => setReqType(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="demande_materiel">💻 Demande de Matériel / Logiciel Labo</option>
                      <option value="rattrapage_planning">📅 Proposition de Cours de Rattrapage</option>
                      <option value="changement_salle">🏫 Demande de Changement de Salle</option>
                      <option value="signalement_absence">⚠️ Signalement d'Absence d'un Enseignant</option>
                      <option value="question_pedagogique">📘 Question d'Évaluation ou Délibération</option>
                      <option value="autre_requete">📋 Autre Requête Administrative</option>
                    </ModernSelect>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Objet de la requête
                    </label>
                    <Input
                      placeholder="Ex: Demande de câbles Ethernet supplémentaires pour Labo Réseaux A"
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      className="rounded-xl h-11 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Niveau de Priorité
                    </label>
                    <ModernSelect 
                      dropdownTitle="Niveau de Priorité"
                      value={reqPriority} 
                      onChange={(e) => setReqPriority(e.target.value as any)}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="normal">🟢 Normale — Traitement sous 48h</option>
                      <option value="high">🟠 Élevée — Traitement sous 24h</option>
                      <option value="urgent">🔴 Urgente — Intervention immédiate</option>
                    </ModernSelect>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message & Justification
                    </label>
                    <textarea
                      placeholder="Détaillez votre demande, les classes impactées (ex: R1-RCS), et la date souhaitée..."
                      rows={4}
                      value={reqMessage}
                      onChange={(e) => setReqMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Transmission en cours..." : "Transmettre à l'Administration"}
                  </Button>
                </form>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
