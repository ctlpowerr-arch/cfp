import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MustChangePasswordModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
}

export default function MustChangePasswordModal({
  isOpen,
  email,
  onSuccess
}: MustChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('itmc2026DLA');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword.trim()) {
      setErrorMessage("Veuillez saisir votre nouveau mot de passe.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (newPassword === 'itmc2026DLA') {
      setErrorMessage("Le nouveau mot de passe doit être différent du mot de passe par défaut (itmc2026DLA).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Votre nouveau mot de passe est enregistré avec succès !");
        onSuccess();
      } else {
        setErrorMessage(data.error || "Erreur lors de la modification du mot de passe");
      }
    } catch (e: any) {
      setErrorMessage("Erreur réseau ou serveur lors du changement de mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[94vw] sm:max-w-md rounded-3xl p-0 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col [&>button]:hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-blue-300 mb-3 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-black text-white tracking-tight">
            Changement Obligatoire du Mot de Passe
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-200/90 mt-1">
            Premier accès détecté ou réinitialisation administrateur pour <strong className="text-white underline">{email}</strong>.
          </DialogDescription>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sécurité Obligatoire ITMC</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
              Votre compte utilise le mot de passe temporaire par défaut (<code className="font-mono font-bold bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">itmc2026DLA</code>). Vous devez définir votre propre mot de passe personnel pour continuer.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Compte Email de Connexion</Label>
              <Input
                type="email"
                value={email}
                disabled
                className="rounded-xl h-11 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mot de Passe Temporaire Actuel</Label>
              <Input
                type="text"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl h-11 text-xs font-mono font-bold border-slate-200 dark:border-slate-700"
                placeholder="itmc2026DLA"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nouveau Mot de Passe Personnel *</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="rounded-xl h-11 text-xs pr-10 border-slate-200 dark:border-slate-700 font-semibold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Confirmer le Nouveau Mot de Passe *</Label>
              <Input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez à l'identique"
                className="rounded-xl h-11 text-xs border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !newPassword || !confirmPassword}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-blue-500/25 mt-2"
          >
            {isSubmitting ? (
              <span>Enregistrement sécurisé...</span>
            ) : (
              <>
                <span>Valider mon Nouveau Mot de Passe</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
