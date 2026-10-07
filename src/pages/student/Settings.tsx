import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  MapPin, 
  CheckCircle2, 
  BellRing,
  Building2,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PRESET_AVATARS = [
  { name: 'Sérieux & Codeur', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { name: 'Créative & Codeuse', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { name: 'Technicien Réseaux', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { name: 'Développeuse IA', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { name: 'Administrateur Base', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden' },
  { name: 'Designeuse UI/UX', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia' },
  { name: 'Chef de Projet IT', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
  { name: 'Architecte Logiciel', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
];

export default function StudentSettings() {
  const { student } = useOutletContext<{ student: any }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '',
    classCode: '',
    specialty: '',
    department: '',
    room: '',
    attendance: 96
  });

  const [currentAvatar, setCurrentAvatar] = useState<string>('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '+237 690 00 00 00',
        level: student.level || '',
        classCode: student.classCode || student.promo || '',
        specialty: student.specialty || '',
        department: student.department || '',
        room: student.room || 'Labo Info 1',
        attendance: student.attendance ?? 96
      });
      
      const saved = localStorage.getItem('custom_avatar_' + student.id);
      setCurrentAvatar(saved || student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name || 'Student'}`);
    }
  }, [student]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (student?.id) {
        await fetch(`/api/students/${encodeURIComponent(student.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar: currentAvatar
          })
        });
      }
      toast.success("Profil étudiant mis à jour et synchronisé avec succès");
      setIsEditing(false);
    } catch {
      toast.error("Erreur lors de la synchronisation du profil étudiant.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsChangingPwd(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || student?.email,
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Mot de passe étudiant modifié avec succès !");
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        toast.error(data.error || "Erreur lors du changement de mot de passe.");
      }
    } catch {
      toast.error("Erreur réseau lors du changement de mot de passe.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    if (!student?.id) return;
    localStorage.setItem('custom_avatar_' + student.id, avatarUrl);
    setCurrentAvatar(avatarUrl);
    window.dispatchEvent(new Event('avatarChanged'));
    toast.success("Image de profil mise à jour avec succès !");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (Maximum 2 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleAvatarChange(reader.result);
      }
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier.");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAvatarUrl.trim()) return;
    if (!customAvatarUrl.startsWith('http://') && !customAvatarUrl.startsWith('https://')) {
      toast.error("Veuillez saisir un lien URL valide (commençant par http:// ou https://)");
      return;
    }
    handleAvatarChange(customAvatarUrl.trim());
    setCustomAvatarUrl('');
  };

  const resetToDefault = () => {
    if (!student?.id) return;
    localStorage.removeItem('custom_avatar_' + student.id);
    const def = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name || 'Student'}`;
    setCurrentAvatar(def);
    window.dispatchEvent(new Event('avatarChanged'));
    toast.success("Image de profil réinitialisée par défaut.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12 px-3 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 break-words">
            Mon Profil Académique
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm break-words">
            Fiche d'identification et statut administratif de l'apprenant CFP-ITMC.
          </p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
          className="rounded-2xl h-11 px-5 sm:px-6 font-bold cursor-pointer w-full sm:w-auto shrink-0 justify-center"
        >
          {isEditing ? 'Enregistrer les modifications' : 'Modifier mes coordonnées'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Identity Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden rounded-[2.5rem] relative">
            <CardContent className="p-8 text-center relative z-10">
              
              {/* Profile Image with Hover/Interaction Area */}
              <div className="relative w-28 h-28 mx-auto mb-5 group">
                <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-blue-500/30 shadow-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500">
                  <img 
                    src={currentAvatar}
                    alt={student?.name}
                    className="w-full h-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Responsive trigger button */}
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg border border-slate-900 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center"
                  title="Changer ma photo de profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-black mb-1">{student?.name || "Étudiant"}</h2>
              <p className="text-blue-400 font-mono font-bold text-xs uppercase tracking-wider mb-3">
                Matricule : {student?.matricule || student?.id || "21ITMC26GL001"}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <Badge className="bg-blue-600 text-white font-bold text-xs border-none">
                  {student?.classCode || student?.promo || "G1-GL"}
                </Badge>
                <Badge className="bg-emerald-500 text-white font-bold text-xs border-none">
                  Inscrit & Actif
                </Badge>
              </div>

              <p className="text-slate-400 text-xs font-medium">
                Année Académique : 2026-2027 • Semestre 1
              </p>
            </CardContent>
          </Card>

          {/* Collapsible Avatar Picker Drawer Panel */}
          {showAvatarPicker && (
            <Card className="rounded-[2.5rem] border-blue-500/30 dark:border-blue-500/20 shadow-lg p-5 bg-white dark:bg-slate-900 space-y-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Choisir mon Avatar
                </h4>
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Upload via local file system */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Importer depuis mon appareil</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="w-full rounded-2xl h-11 border-dashed border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  Téléverser une image (Max 2Mo)
                </Button>
              </div>

              {/* Presets Gallery Grid */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Galerie CFP-ITMC d'avatars</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleAvatarChange(p.url)}
                      className={`aspect-square rounded-xl p-1 border-2 transition-all hover:scale-110 bg-slate-50 dark:bg-slate-800 overflow-hidden ${
                        currentAvatar === p.url ? 'border-blue-500 scale-105' : 'border-slate-100 dark:border-slate-800'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Import */}
              <form onSubmit={handleUrlSubmit} className="space-y-1.5 pt-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lien direct d'une image web</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/maphoto.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                  <Button type="submit" size="sm" className="rounded-xl font-bold bg-blue-600 text-xs px-3">
                    Valider
                  </Button>
                </div>
              </form>

              {/* Reset to Default */}
              <button
                onClick={resetToDefault}
                className="w-full text-center text-[11px] font-bold text-red-500 hover:underline pt-1.5 block cursor-pointer"
              >
                Réinitialiser à l'avatar par défaut
              </button>
            </Card>
          )}

          <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm p-6 bg-white dark:bg-slate-900 space-y-4">
            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Sécurité du Compte
            </h4>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(!showPasswordModal)}
                className="w-full justify-start rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Modifier le mot de passe
              </Button>
            </div>

            {showPasswordModal && (
              <form onSubmit={handlePasswordChange} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="password"
                  placeholder="Mot de passe actuel"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe (min. 6 car.)"
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <Button
                  type="submit"
                  disabled={isChangingPwd}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  {isChangingPwd ? 'Validation...' : 'Enregistrer le mot de passe'}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Right 2 Cols: Details & Academic Registration */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white">
                Dossier d'Inscription & Affectation
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Informations administratives enregistrées dans le registre de l'établissement.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Nom & Prénom
                  </label>
                  {isEditing ? (
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full font-bold text-sm text-slate-900 bg-white dark:bg-slate-800 dark:text-white p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <User className="w-4 h-4 text-blue-500" />
                      {formData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Adresse Email Institutionnelle
                  </label>
                  {isEditing ? (
                    <input 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full font-bold text-sm text-slate-900 bg-white dark:bg-slate-800 dark:text-white p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      {formData.email}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Classe & Promotion
                  </label>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                    {formData.classCode} ({formData.level})
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Filière / Spécialité
                  </label>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    {formData.specialty || 'Génie Logiciel & Systèmes'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Département Pédagogique
                  </label>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    {formData.department || 'Informatique & Numérique'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Salle & Laboratoire Attitré
                  </label>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {formData.room || 'Labo Info 1'}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Academic Standing & Tuition status */}
          <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-8 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Situation Financière & Scolarité
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Statut Comptable
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Frais de scolarité à jour (Tranche 1 validée)
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reçu N° ITMC-REC-2026-904
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" /> Carte d'Étudiant Numérique
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Délivrée • Valide jusqu'au 31/08/2027
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Accès laboratoires & bibliothèque activé
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
