import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  CheckCheck,
  AlertCircle, 
  Info, 
  Calendar, 
  BookOpen, 
  Award,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Flame
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { gameAudio } from "@/lib/gameAudio";

interface StudentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onNotificationsUpdated?: () => void;
}

export default function StudentNotificationModal({
  isOpen,
  onClose,
  student,
  onNotificationsUpdated
}: StudentNotificationModalProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'admin' | 'teacher' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?studentId=${student?.id || ''}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && student?.id) {
      fetchNotifs();
    }
  }, [isOpen, student]);

  const markAsRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId: student?.id })
      });
      setNotifications(prev => prev.map(n => {
        if (n.id === notifId) {
          const readBy = Array.isArray(n.readBy) ? [...n.readBy, student.id] : [student.id];
          return { ...n, readBy };
        }
        return n;
      }));
      if (onNotificationsUpdated) onNotificationsUpdated();
      window.dispatchEvent(new CustomEvent('notification_sent'));
      toast.success("Avis marqué comme lu");
    } catch (err) {
      toast.error("Erreur de synchronisation");
    }
  };

  const markAllAsRead = async () => {
    if (!student?.id) return;
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId: student.id })
      });
      setNotifications(prev => prev.map(n => {
        const readBy = Array.isArray(n.readBy) 
          ? (n.readBy.includes(student.id) ? n.readBy : [...n.readBy, student.id])
          : [student.id];
        return { ...n, readBy };
      }));
      if (onNotificationsUpdated) onNotificationsUpdated();
      window.dispatchEvent(new CustomEvent('notification_sent'));
      toast.success("Toutes les notifications ont été marquées comme lues !");
    } catch (err) {
      toast.error("Impossible de marquer toutes les notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  const isRead = (notif: any) => {
    return Array.isArray(notif.readBy) && notif.readBy.includes(student?.id);
  };

  const unreadCount = notifications.filter(n => !isRead(n)).length;

  const filtered = notifications.filter(n => {
    if (activeFilter === 'unread' && isRead(n)) return false;
    if (activeFilter === 'admin' && n.senderRole !== 'admin') return false;
    if (activeFilter === 'teacher' && n.senderRole !== 'teacher') return false;
    if (activeFilter === 'urgent' && n.priority !== 'urgent') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchMessage = n.message?.toLowerCase().includes(q);
      const matchSender = n.sender?.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage && !matchSender) return false;
    }
    return true;
  });

  const getNotifIcon = (notif: any) => {
    if (notif.priority === 'urgent') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (notif.title?.toLowerCase().includes('note') || notif.title?.toLowerCase().includes('cc') || notif.title?.toLowerCase().includes('relevé')) {
      return <Award className="w-5 h-5 text-purple-500" />;
    }
    if (notif.title?.toLowerCase().includes('cours') || notif.title?.toLowerCase().includes('support')) {
      return <BookOpen className="w-5 h-5 text-blue-500" />;
    }
    if (notif.title?.toLowerCase().includes('planning') || notif.title?.toLowerCase().includes('emploi') || notif.title?.toLowerCase().includes('émargement')) {
      return <Calendar className="w-5 h-5 text-emerald-500" />;
    }
    return <Info className="w-5 h-5 text-blue-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] max-w-2xl p-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[88vh]">
        
        {/* Header - fixed at top */}
        <div className="p-5 sm:p-7 bg-slate-900 text-white relative shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  Communications &amp; Avis
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-medium truncate mt-0.5">
                  Directives administratives et annonces enseignants
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {unreadCount > 0 ? (
                <Badge className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-sm">
                  {unreadCount} non lu(s)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1 rounded-xl">
                  À jour
                </Badge>
              )}

              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl h-8 px-2.5 cursor-pointer flex items-center gap-1.5"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tout lire</span>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filter Tabs - Flex Wrap, NO ugly horizontal scrollbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-800">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'unread', label: `Non lues (${unreadCount})` },
              { key: 'admin', label: 'Administration' },
              { key: 'teacher', label: 'Enseignants' },
              { key: 'urgent', label: 'Urgents' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={cn(
                  "px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  activeFilter === tab.key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/10 text-slate-300 hover:bg-white/15"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search bar for maximum efficiency */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, cours ou enseignant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Chargement des avis...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Aucune communication trouvée
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {searchQuery 
                  ? "Aucun avis ne correspond à votre recherche. Réessayez avec un autre mot-clé."
                  : "Toutes vos notifications sont à jour et consultées."}
              </p>
              {searchQuery && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl text-xs font-bold mt-2"
                >
                  Réinitialiser la recherche
                </Button>
              )}
            </div>
          ) : (
            filtered.map((notif) => {
              const read = isRead(notif);
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border transition-all space-y-2.5",
                    read 
                      ? "bg-slate-50/70 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-80 hover:opacity-100"
                      : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-sm ring-1 ring-blue-500/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700">
                        {getNotifIcon(notif)}
                      </div>
                      
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                        notif.senderRole === 'admin' 
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                          : "bg-blue-600 text-white"
                      )}>
                        {notif.senderRole === 'admin' ? 'Administration' : 'Enseignant'}
                      </span>
                      
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {notif.sender}
                      </span>

                      {notif.priority === 'urgent' && (
                        <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Urgent
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {new Date(notif.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <h4 className={cn(
                      "text-sm font-black mb-1 leading-snug",
                      read ? "text-slate-800 dark:text-slate-200" : "text-blue-950 dark:text-white"
                    )}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    {notif.actionUrl ? (
                      <button
                        onClick={() => {
                          onClose();
                          if (!read) markAsRead(notif.id);
                          navigate(notif.actionUrl);
                        }}
                        className="font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        Consulter directement <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span />
                    )}

                    {!read ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notif.id)}
                        className="h-8 text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Marquer comme lu
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Lu
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>{filtered.length} communication(s) affichée(s)</span>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-bold text-xs h-8 px-4"
          >
            Fermer
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
