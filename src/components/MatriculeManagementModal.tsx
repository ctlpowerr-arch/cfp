import React, { useState, useMemo, useRef } from 'react';
import { 
  Hash, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Check, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Filter, 
  School, 
  Calendar,
  Layers,
  ArrowUpDown,
  BookOpen,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
  Settings2,
  Printer,
  Download,
  FileText
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import { 
  SPECIALTY_MATRICULE_REGISTRY, 
  decomposeMatricule, 
  generateOfficialMatricule, 
  sortStudentsAlphabetically 
} from '@/utils/matriculeEngine';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { exportElementToPDF, printElementDirect } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MatriculeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  onRefresh: () => Promise<void>;
}

export default function MatriculeManagementModal({
  isOpen,
  onClose,
  students,
  onRefresh
}: MatriculeManagementModalProps) {
  const { selectedYear } = useAcademicYear();
  const currentAy = selectedYear || "2026-2027";

  const printRegisterRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [casingOption, setCasingOption] = useState<'upper' | 'lower'>('upper');
  const [forceRegenerate, setForceRegenerate] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Single Student Matricule Edit State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [customMatriculeInput, setCustomMatriculeInput] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('Modification administrative Super Admin');
  const [isSavingSingle, setIsSavingSingle] = useState<boolean>(false);
  const [copiedMatricule, setCopiedMatricule] = useState<string | null>(null);

  // Filter students by selected year
  const yearStudents = useMemo(() => {
    return students.filter(s => !currentAy || s.academicYear === currentAy || !s.academicYear);
  }, [students, currentAy]);

  // Filter and group by specialty & search query
  const filteredStudents = useMemo(() => {
    return yearStudents.filter(s => {
      if (activeSpecialtyFilter !== 'all') {
        const specMeta = SPECIALTY_MATRICULE_REGISTRY.find(item => item.id === activeSpecialtyFilter);
        const matchName = specMeta ? s.specialty?.toLowerCase().includes(specMeta.name.toLowerCase()) || s.specialty?.toLowerCase() === specMeta.id : false;
        if (!matchName) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.name?.toLowerCase().includes(q);
        const matchMatricule = s.matricule?.toLowerCase().includes(q);
        const matchSpec = s.specialty?.toLowerCase().includes(q);
        if (!matchName && !matchMatricule && !matchSpec) return false;
      }

      return true;
    });
  }, [yearStudents, activeSpecialtyFilter, searchQuery]);

  // Alphabetically sorted students within their specialty
  const sortedStudentsWithRank = useMemo(() => {
    // Group by specialty then sort A-Z
    const grouped = new Map<string, any[]>();
    yearStudents.forEach(s => {
      const specKey = s.specialty || 'Autre';
      if (!grouped.has(specKey)) grouped.set(specKey, []);
      grouped.get(specKey)!.push(s);
    });

    const studentRankMap = new Map<string, number>();
    for (const [, list] of grouped.entries()) {
      const sorted = sortStudentsAlphabetically(list);
      sorted.forEach((std, idx) => {
        studentRankMap.set(std.id, idx + 1);
      });
    }

    return filteredStudents.map(s => ({
      ...s,
      alphabeticalRank: studentRankMap.get(s.id) || 1
    }));
  }, [yearStudents, filteredStudents]);

  const handleCopy = (matricule: string) => {
    navigator.clipboard.writeText(matricule);
    setCopiedMatricule(matricule);
    toast.success(`Matricule ${matricule} copié !`);
    setTimeout(() => setCopiedMatricule(null), 2000);
  };

  const handlePrintRegister = () => {
    if (!printRegisterRef.current) return;
    printElementDirect(printRegisterRef.current, `Registre_Matricules_MINEFOP_${currentAy}`);
  };

  const handleDownloadRegisterPdf = async () => {
    if (!printRegisterRef.current) return;
    try {
      setIsExportingPdf(true);
      const specMeta = SPECIALTY_MATRICULE_REGISTRY.find(s => s.id === activeSpecialtyFilter);
      const specTag = specMeta ? specMeta.code : 'TOUTES_FILIERES';
      const filename = `REGISTRE_MATRICULES_MINEFOP_${specTag}_${currentAy}.pdf`;
      await exportElementToPDF(printRegisterRef.current, filename, { scale: 2, quality: 0.98 });
      toast.success("Registre officiel des matricules MINEFOP téléchargé au format PDF !");
    } catch (e) {
      console.error("Error exporting register PDF:", e);
      toast.error("Erreur lors de la génération du registre PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBatchGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/students/generate-matricules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYear: currentAy,
          forceAll: forceRegenerate,
          casing: casingOption,
          specialtyId: activeSpecialtyFilter
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Matricules officiels MINEFOP attribués par ordre alphabétique !");
        await onRefresh();
      } else {
        toast.error(data.error || "Échec de la génération des matricules");
      }
    } catch (e) {
      toast.error("Erreur serveur lors de la génération des matricules");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setCustomMatriculeInput(student.matricule || '');
    setEditReason('Modification manuelle par le Super Administrateur');
  };

  const handleSaveCustomMatricule = async () => {
    if (!editingStudent || !customMatriculeInput.trim()) {
      toast.error("Le matricule ne peut pas être vide.");
      return;
    }

    try {
      setIsSavingSingle(true);
      const res = await fetch(`/api/students/${editingStudent.id}/matricule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricule: customMatriculeInput.trim(),
          reason: editReason
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Matricule de ${editingStudent.name} mis à jour avec succès !`);
        setEditingStudent(null);
        await onRefresh();
      } else {
        toast.error(data.error || "Échec de mise à jour du matricule");
      }
    } catch (e) {
      toast.error("Erreur serveur lors de la modification du matricule");
    } finally {
      setIsSavingSingle(false);
    }
  };

  const decomposedPreview = useMemo(() => {
    if (!customMatriculeInput.trim()) return null;
    return decomposeMatricule(customMatriculeInput.trim());
  }, [customMatriculeInput]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] sm:w-[94vw] lg:max-w-6xl max-h-[95vh] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Hash className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Générateur & Registre des Matricules Officiels MINEFOP
                  </DialogTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                    CFP-ITMC Cameroun
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Attribution automatique, classement alphabétique (A→Z) et modification manuelle Super Admin pour la session <strong className="text-slate-900 dark:text-white">{currentAy}</strong>.
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrintRegister}
                className="gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs h-10 px-3 cursor-pointer"
                title="Imprimer directement le registre officiel des matricules"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Imprimer</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadRegisterPdf}
                disabled={isExportingPdf}
                className="gap-1.5 rounded-xl border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-900 dark:text-blue-200 font-extrabold text-xs h-10 px-3.5 cursor-pointer"
                title="Télécharger le document PDF officiel du registre des matricules par filière ou au niveau du centre"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{isExportingPdf ? "Génération PDF..." : "Télécharger PDF Registre"}</span>
              </Button>

              <Button
                type="button"
                onClick={handleBatchGenerate}
                disabled={isGenerating}
                className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Générer / Réordonner A→Z ({currentAy.slice(2, 4) || '26'})</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Official Structure Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border-b border-blue-100 dark:border-slate-800 text-xs shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Structure Officielle des Centres de Formation Professionnelle au Cameroun (MINEFOP) :
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-950 dark:text-blue-200" title="Numéro de la filière parmi les 35 spécialités">
                [N° Filière 1-35]
              </span>
              <span className="text-slate-400">+</span>
              <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-200" title="Sigle officiel de l'Institut">
                ITMC
              </span>
              <span className="text-slate-400">+</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-950 dark:text-amber-200" title="Année de la session académique">
                {currentAy.slice(2, 4) || '26'}
              </span>
              <span className="text-slate-400">+</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200" title="Initiales / Code de la spécialité">
                [Code Spécialité]
              </span>
              <span className="text-slate-400">+</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-950 dark:text-purple-200" title="Numéro d'ordre chronologique par ordre alphabétique A-Z">
                [001, 002...]
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher par nom d'élève, matricule, filière..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-xs h-9"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <ModernSelect
                dropdownTitle="Filtrer par Spécialité"
                value={activeSpecialtyFilter}
                onChange={(e) => setActiveSpecialtyFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 font-medium"
              >
                <option value="all">🎓 Toutes les 35 Spécialités</option>
                {SPECIALTY_MATRICULE_REGISTRY.map(spec => (
                  <option key={spec.id} value={spec.id}>
                    #{spec.index} {spec.name} ({spec.code})
                  </option>
                ))}
              </ModernSelect>
            </div>

            {/* Options Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceRegenerate}
                  onChange={(e) => setForceRegenerate(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Forcer la réattribution A→Z</span>
              </label>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4 w-16 text-center">Rang A-Z</th>
                  <th className="py-3 px-4">Apprenant(e) & Identité</th>
                  <th className="py-3 px-4">Spécialité & Filière DQP</th>
                  <th className="py-3 px-4">Matricule Officiel</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Actions Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedStudentsWithRank.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      Aucun apprenant ne correspond aux critères de sélection.
                    </td>
                  </tr>
                ) : (
                  sortedStudentsWithRank.map((student) => {
                    const isCustom = student.isCustomMatricule === true;
                    const decomposed = decomposeMatricule(student.matricule || '');

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Rank */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono font-black text-[11px]">
                            #{student.alphabeticalRank.toString().padStart(3, '0')}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center shrink-0">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                <span className="underline decoration-blue-500 font-black">{student.name?.charAt(0)}</span>
                                {student.name?.slice(1)}
                              </p>
                              <p className="text-[10.5px] text-slate-500">{student.email || 'Email standard'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Specialty */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {student.specialty || 'Génie Logiciel'}
                            </span>
                            <span className="text-[10px] text-blue-600 font-medium">
                              Classe : {student.classCode || student.promo || 'G1'}
                            </span>
                          </div>
                        </td>

                        {/* Matricule Badge */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Badge className={cn(
                              "font-mono font-black text-xs px-2.5 py-1 tracking-wider border shadow-2xs",
                              isCustom 
                                ? "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                            )}>
                              {student.matricule || 'Non généré'}
                            </Badge>
                            {student.matricule && (
                              <button
                                type="button"
                                onClick={() => handleCopy(student.matricule)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                                title="Copier le matricule"
                              >
                                {copiedMatricule === student.matricule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4">
                          {isCustom ? (
                            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 font-bold">
                              ✏️ Modifié Super Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                              ⚡ Auto MINEFOP
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(student)}
                            className="h-8 px-2.5 rounded-xl border-slate-200 hover:bg-blue-50 text-blue-700 dark:hover:bg-blue-950/50 text-xs font-bold gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modifier Matricule</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Total : <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> apprenant(s) répertorié(s) pour la session {currentAy}.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold"
          >
            Fermer le Registre
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* ========================================================================= */}
      {/* SUB-MODAL: MODIFICATION MANUELLE DU MATRICULE PAR LE SUPER ADMIN */}
      {/* ========================================================================= */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Modifier le Matricule de l'Apprenant
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Dérogation & Personnalisation administrative par le Super Administrateur
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Student Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Nom de l'élève :</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{editingStudent.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Filière / Spécialité :</span>
                  <span className="font-bold text-blue-600">{editingStudent.specialty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Session Académique :</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{editingStudent.academicYear || currentAy}</span>
                </div>
              </div>

              {/* Matricule Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Nouveau Matricule Officiel *
                </label>
                <Input
                  value={customMatriculeInput}
                  onChange={(e) => setCustomMatriculeInput(e.target.value)}
                  placeholder="Ex: 21ITMC26GL001 ou 1itmc26gl001"
                  className="rounded-xl h-11 font-mono text-sm font-black uppercase tracking-wider"
                  required
                />
              </div>

              {/* Live Structure Decomposition Preview */}
              {decomposedPreview && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950 dark:text-blue-300">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Décomposition MINEFOP du Matricule :</span>
                  </div>
                  {decomposedPreview.isValidFormat ? (
                    <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
                      <div>• N° Filière : <strong>#{decomposedPreview.specialtyIndex} ({decomposedPreview.specialtyName})</strong></div>
                      <div>• Institut : <strong>{decomposedPreview.instituteAcronym}</strong></div>
                      <div>• Session : <strong>{decomposedPreview.sessionYear}</strong></div>
                      <div>• Rang A→Z : <strong>N° {decomposedPreview.orderPad}</strong></div>
                    </div>
                  ) : (
                    <p className="text-amber-800 dark:text-amber-300 italic">
                      Format personnalisé détecté. Ce matricule sera enregistré tel quel et synchronisé sur tous les documents.
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Motif / Justificatif de la Modification
                </label>
                <Input
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Précisez le motif..."
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingStudent(null)}
                  disabled={isSavingSingle}
                  className="rounded-xl text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveCustomMatricule}
                  disabled={isSavingSingle || !customMatriculeInput.trim()}
                  className="rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shadow-sm"
                >
                  {isSavingSingle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer & Synchroniser Partout</span>
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Printable MINEFOP Matricule Register Document Area (Captured for PDF Export) */}
      <div className="hidden">
        <div
          ref={printRegisterRef}
          id="printable-minefop-register"
          className="p-8 bg-white text-slate-900 font-sans space-y-6 text-xs max-w-[850px] mx-auto relative overflow-hidden"
        >
          {/* Security Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img
              src="/watermark-logo.png"
              alt=""
              className="w-[320px] max-w-[70%] h-auto opacity-[0.06] object-contain"
            />
          </div>

          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-xs font-black uppercase text-blue-950 tracking-wide">RÉPUBLIQUE DU CAMEROUN</h2>
              <p className="text-[8.5px] text-slate-500 font-bold uppercase">Paix - Travail - Patrie</p>
              <p className="text-[9.5px] text-slate-900 font-black uppercase mt-1">MINISTÈRE DE L'EMPLOI ET DE LA FORMATION PROFESSIONNELLE</p>
              <p className="text-[9px] text-slate-700 font-bold">Centre de Formation Professionnelle CFP-ITMC Douala</p>
              <p className="text-[8.5px] text-slate-500">Douala Logpom, Carrefour Bassong • Contact: (+237) 683 66 32 22 / 688 05 20 94</p>
            </div>
            <div className="text-right space-y-1">
              <div className="px-3 py-1 bg-blue-900 text-white font-black text-[9.5px] uppercase rounded">
                REGISTRE NATIONAL DES MATRICULES DQP
              </div>
              <p className="text-[9px] font-mono font-bold text-slate-800">Session Académique : {currentAy}</p>
              <p className="text-[8.5px] text-slate-500">Édité le : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-slate-100 rounded-xl border border-slate-300 space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              REPERTOIRE OFFICIEL DES MATRICULES MINEFOP ATTRIBUÉS AUX APPRENANTS
            </h3>
            <p className="text-[10px] text-blue-900 font-extrabold uppercase">
              {activeSpecialtyFilter === 'all' 
                ? "RÉPERTOIRE GÉNÉRAL INSTITUTIONNEL (TOUTES SPÉCIALITÉS DQP)" 
                : `FILIÈRE DQP : ${SPECIALTY_MATRICULE_REGISTRY.find(s => s.id === activeSpecialtyFilter)?.name.toUpperCase() || activeSpecialtyFilter}`}
            </p>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-3 gap-3 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[8.5px] uppercase font-bold text-slate-500">Total Immatriculés</p>
              <p className="text-sm font-black text-blue-900">{sortedStudentsWithRank.length} Apprenant(s)</p>
            </div>
            <div>
              <p className="text-[8.5px] uppercase font-bold text-slate-500">Filière / Spécialité</p>
              <p className="text-xs font-bold text-slate-800 truncate">
                {activeSpecialtyFilter === 'all' ? "35 Spécialités DQP" : SPECIALTY_MATRICULE_REGISTRY.find(s => s.id === activeSpecialtyFilter)?.name || 'Spécialité'}
              </p>
            </div>
            <div>
              <p className="text-[8.5px] uppercase font-bold text-slate-500">Norme Nationale Cameroun</p>
              <p className="text-xs font-mono font-bold text-blue-800">[Filière][ITMC][Session][Code][Rang]</p>
            </div>
          </div>

          {/* Master Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[10.5px] border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-black border-b border-slate-300">
                  <th className="p-2 w-12 text-center border-r border-slate-300">N° Rang</th>
                  <th className="p-2 border-r border-slate-300">Nom & Prénom de l'Apprenant(e)</th>
                  <th className="p-2 border-r border-slate-300">Spécialité / Filière DQP</th>
                  <th className="p-2 border-r border-slate-300 font-mono text-center">Matricule MINEFOP</th>
                  <th className="p-2 text-center">Classe / Promo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedStudentsWithRank.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-slate-500">
                      Aucun apprenant enregistré dans ce registre.
                    </td>
                  </tr>
                ) : (
                  sortedStudentsWithRank.map((std, i) => (
                    <tr key={std.id || i} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-200">
                        #{std.alphabeticalRank.toString().padStart(3, '0')}
                      </td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                        {std.name}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-700">
                        {std.specialty || 'Génie Logiciel'}
                      </td>
                      <td className="p-2 font-mono font-black text-center text-blue-900 border-r border-slate-200">
                        {std.matricule || 'En cours'}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-700">
                        {std.promo || std.classCode || 'G1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legal Footer & Official Stamps */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-[9.5px] items-end border-t border-slate-300">
            <div>
              <p className="font-black text-slate-900 uppercase">Le Directeur des Études & de la Pédagogie</p>
              <p className="text-slate-500 italic mt-8">Certification officielle CFP-ITMC Douala</p>
            </div>

            <div className="text-right space-y-1">
              <p className="font-black text-slate-900 uppercase">Visa de l'Inspection Régionale MINEFOP</p>
              <div className="h-12 border-2 border-blue-900 bg-blue-50/50 rounded flex items-center justify-center font-black text-[9px] text-blue-950 uppercase">
                SCE EXAMENS & CERTIFICATION • CACHET OFFICIEL
              </div>
              <p className="text-[8.5px] text-slate-500 font-mono">Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
