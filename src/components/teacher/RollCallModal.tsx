import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Printer, 
  CheckCheck, 
  AlertTriangle,
  Building2,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any | null; // schedule session or class object
  teacher: any;
  onSuccess?: () => void;
}

export default function RollCallModal({
  isOpen,
  onClose,
  session,
  teacher,
  onSuccess
}: RollCallModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Status dictionary: studentId -> 'present' | 'absent' | 'late'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const classCode = session?.classCode || session?.code || 'G1-GL';
  const className = session?.className || session?.name || classCode;
  const subjectName = session?.subject || session?.name || 'Séance Pédagogique';
  const roomName = session?.room || 'Salle Principale';

  useEffect(() => {
    if (!isOpen || !classCode) return;
    setLoading(true);
    fetch('/api/students')
      .then(res => res.json())
      .then(allStudents => {
        // Filter students in this classCode
        const classStudents = allStudents.filter((s: any) => 
          s.classCode === classCode || 
          s.promo === classCode || 
          s.classCode === session?.id ||
          (classCode.includes('-') && s.promo === classCode.split('-')[0])
        );
        setStudents(classStudents);
        // Default everyone to 'present'
        const initialMap: Record<string, 'present' | 'absent' | 'late'> = {};
        classStudents.forEach((s: any) => {
          initialMap[s.id] = 'present';
        });
        setAttendanceMap(initialMap);
      })
      .catch(err => {
        console.error("Failed to load students for roll call", err);
        toast.error("Erreur lors de la récupération des étudiants");
      })
      .finally(() => setLoading(false));
  }, [isOpen, classCode]);

  const handleSetStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.error("Aucun étudiant à émarger");
      return;
    }

    setSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'present'
      }));

      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionScheduleId: session?.id || null,
          classCode,
          teacherId: teacher?.id,
          teacherName: teacher?.name,
          date: new Date().toISOString(),
          records
        })
      });

      if (res.ok) {
        toast.success(`Émargement validé avec succès pour la classe ${classCode} ! Données synchronisées avec l'Administration.`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("Erreur lors de l'enregistrement de l'émargement");
      }
    } catch (err) {
      toast.error("Échec de connexion avec le serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter(st => st === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(st => st === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter(st => st === 'late').length;

  const handlePrintAttendanceSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = students.map((s, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${s.id}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${s.name}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${s.email}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${
          attendanceMap[s.id] === 'present' ? '#15803d' : attendanceMap[s.id] === 'late' ? '#b45309' : '#b91c1c'
        }">
          ${attendanceMap[s.id] === 'present' ? 'PRÉSENT' : attendanceMap[s.id] === 'late' ? 'EN RETARD' : 'ABSENT'}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 120px;"></td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>EMARGEMENT_${classCode.replace(/\s+/g, '_')}</title>
        <style>
          @page { size: A4 portrait; margin: 0mm; }
          *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 10mm 12mm; margin: 0; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 12px; }
          th { background: #0f172a; color: #fff; padding: 7px 9px; border: 1px solid #0f172a; text-transform: uppercase; font-size: 9px; }
          .footer { display: flex; justify-content: space-between; margin-top: 30px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 16px; font-weight: 900; color: #0f172a;">CFP-ITMC</div>
          <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Registre Numérique d'Émargement des Séances de Cours</div>
        </div>
        <div style="margin-bottom: 10px; font-size: 12px; line-height: 1.6;">
          <strong>Classe :</strong> ${classCode} (${className}) &nbsp;|&nbsp; <strong>Matière :</strong> ${subjectName}<br/>
          <strong>Enseignant :</strong> ${teacher?.name} &nbsp;|&nbsp; <strong>Salle :</strong> ${roomName} &nbsp;|&nbsp; <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}<br/>
          <strong>Statistiques :</strong> ${presentCount}/${total} Présents, ${absentCount} Absents, ${lateCount} Retards
        </div>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Matricule</th>
              <th>Nom &amp; Prénoms de l'Étudiant</th>
              <th>Email Institutionnel</th>
              <th>Statut Émargé</th>
              <th>Signature Apprenant</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          <div><strong>Signature Enseignant Formateur</strong><br/><br/><br/>${teacher?.name}</div>
          <div><strong>Visa de la Direction Pédagogique</strong><br/><br/><br/>CFP-ITMC Secrétariat</div>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-w-2xl rounded-[2.5rem] border-none p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-black text-xs px-3 py-1">
                {classCode}
              </Badge>
              <Badge variant="outline" className="text-slate-600 border-slate-300 font-bold text-xs">
                {roomName}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAttendanceSheet}
              className="h-8 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              Imprimer Feuille
            </Button>
          </div>

          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-600" />
            Émargement & Feuille d'Appel Numérique
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-500 mt-1">
            {subjectName} • Enseignant formateur : <strong className="text-slate-700 dark:text-slate-300">{teacher?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Attendance Summary Bar */}
        <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 my-2">
          <div className="text-center p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Inscrits</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{total}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm">
            <span className="text-[10px] font-black uppercase block">Présents</span>
            <span className="text-base font-black">{presentCount}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 shadow-sm">
            <span className="text-[10px] font-black uppercase block">Absents</span>
            <span className="text-base font-black">{absentCount}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-sm">
            <span className="text-[10px] font-black uppercase block">Retards</span>
            <span className="text-base font-black">{lateCount}</span>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-bold text-slate-500">
            Cochez le statut de chaque étudiant :
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('present')}
              className="h-7 text-[11px] font-bold rounded-lg text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              <CheckCheck className="w-3 h-3 mr-1" /> Tous Présents
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('absent')}
              className="h-7 text-[11px] font-bold rounded-lg text-red-700 border-red-200 hover:bg-red-50"
            >
              Tous Absents
            </Button>
          </div>
        </div>

        {/* Student Roster */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs">
            Chargement de la liste des apprenants de la classe...
          </div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
            Aucun étudiant trouvé pour la classe {classCode}.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {students.map((student, idx) => {
              const currentStatus = attendanceMap[student.id] || 'present';
              return (
                <div
                  key={student.id}
                  className={cn(
                    "p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    currentStatus === 'present' ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" :
                    currentStatus === 'late' ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" :
                    "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">
                        {student.name}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Matricule: {student.id} • Assiduité globale: {student.attendance || 90}%
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(student.id, 'present')}
                      className={cn(
                        "px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1",
                        currentStatus === 'present'
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                          : "bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Présent
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(student.id, 'late')}
                      className={cn(
                        "px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1",
                        currentStatus === 'late'
                          ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                          : "bg-white dark:bg-slate-800 text-slate-500 hover:text-amber-600 border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <Clock className="w-3 h-3" /> Retard
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(student.id, 'absent')}
                      className={cn(
                        "px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1",
                        currentStatus === 'absent'
                          ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                          : "bg-white dark:bg-slate-800 text-slate-500 hover:text-red-600 border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <XCircle className="w-3 h-3" /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer & Submit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-11 px-5 rounded-2xl text-xs font-bold"
          >
            Annuler
          </Button>

          <Button
            type="button"
            disabled={submitting || students.length === 0}
            onClick={handleSubmit}
            className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Validation & Synchro..." : "Valider & Enregistrer l'Émargement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
