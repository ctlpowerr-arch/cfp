import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, Check, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { useAcademicYear } from '../context/AcademicYearContext';

interface AcademicYearSelectorProps {
  compact?: boolean;
}

export const AcademicYearSelector: React.FC<AcademicYearSelectorProps> = ({ compact = false }) => {
  const { selectedYear, setSelectedYear, years, addAcademicYear } = useAcademicYear();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [isCurrentYear, setIsCurrentYear] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeYearObj = years.find(y => y.name === selectedYear) || { name: selectedYear, status: 'Active' };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');

    const success = await addAcademicYear(newYearName.trim(), isCurrentYear);
    setIsSubmitting(false);

    if (success) {
      setNewYearName('');
      setShowAddModal(false);
      setIsOpen(false);
    } else {
      setErrorMsg('Erreur lors de la création de l\'année (elle existe peut-être déjà).');
    }
  };

  return (
    <div className="relative">
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 text-left ${
          compact 
            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 text-xs' 
            : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-xs hover:border-emerald-300 text-slate-800 text-sm font-medium'
        }`}
        title="Changer l'année académique active"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          {!compact && <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Année Académique</span>}
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span>{selectedYear}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
              activeYearObj.status === 'En Cours' 
                ? 'bg-emerald-100 text-emerald-700' 
                : activeYearObj.status === 'Clôturée'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {activeYearObj.status || 'Active'}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Académique</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Isolation Données
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Chaque année dispose de son propre environnement de données vierge.
              </p>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 py-1">
              {years.map((year) => {
                const isSelected = year.name === selectedYear;
                return (
                  <button
                    key={year.id}
                    onClick={() => {
                      setSelectedYear(year.name);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span>{year.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        year.status === 'En Cours'
                          ? 'bg-emerald-100 text-emerald-700'
                          : year.status === 'Clôturée'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {year.status}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 border-t border-slate-100 mt-1">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une nouvelle année</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal to Add New Academic Year */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nouvelle Année Académique</h3>
                  <p className="text-xs text-slate-500">Ajouter une nouvelle session et démarrer un registre vierge</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'année académique (ex: 2026-2027)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 2026-2027"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Note importante :</strong> L'ouverture d'une nouvelle année académique crée un espace de travail totalement séparé. Les étudiants, modules et enseignants créés dans cette session n'impacteront pas les années antérieures.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isCurrentYearCheck"
                  checked={isCurrentYear}
                  onChange={(e) => setIsCurrentYear(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isCurrentYearCheck" className="text-xs font-medium text-slate-700">
                  Définir comme année académique courante de l'établissement
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Création...' : 'Créer et Se Connecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
