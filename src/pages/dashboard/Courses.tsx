import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  GraduationCap, 
  Plus, 
  Edit2, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  AlertCircle,
  FolderHeart,
  Save,
  Undo,
  ShieldCheck,
  MapPin,
  Zap
} from 'lucide-react';
import { defaultSpecialties, FILIERES, SpecialtyItem, enrichSpecialty } from '@/data/specialtiesData';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/select";

export default function CoursesPage() {
  // --- STATE ---
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [activeRole, setActiveRole] = useState<'visitor' | 'teacher' | 'admin'>('admin'); // Admin by default to let them customize easily!
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modal / Drawer state for viewing & editing
  const [activeSpecialtyId, setActiveSpecialtyId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createFiliere, setCreateFiliere] = useState<string>("Technologies de l'information et du numérique");
  const [createSubCategory, setCreateSubCategory] = useState<string>("Informatique");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Form states for the editor
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLongDesc, setEditLongDesc] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Enriched field states
  const [editModules, setEditModules] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editOpportunities, setEditOpportunities] = useState('');
  const [editTuition, setEditTuition] = useState('');
  const [editCertification, setEditCertification] = useState('');
  const [editStudyRhythm, setEditStudyRhythm] = useState('');

  // Load from LocalStorage or Fallback to default canonical 35 specialties
  useEffect(() => {
    localStorage.removeItem('cfpitmc_specialties_v4');
    const stored = localStorage.getItem('cfpitmc_specialties_v5');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if stored contains the 35 new specialties
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

  const saveToStorage = (updatedList: SpecialtyItem[]) => {
    setSpecialties(updatedList);
    localStorage.setItem('cfpitmc_specialties_v5', JSON.stringify(updatedList));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- FILTERS & COMPUTATIONS ---
  const filteredSpecialties = specialties.filter(item => {
    const filiereConf = Object.values(FILIERES).find(f => f.id.toLowerCase() === selectedFiliere.toLowerCase());
    const matchesFiliere = selectedFiliere === 'all' || 
      item.filiere.toLowerCase() === selectedFiliere.toLowerCase() ||
      (filiereConf && item.filiere.toLowerCase() === filiereConf.name.toLowerCase());
    
    // Subcategory matches
    const matchesSub = selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;

    // Search query matches
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.longDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFiliere && matchesSub && matchesSearch;
  });

  // Get all unique subcategories for the selected filiere (or all if selectedFiliere is 'all')
  const availableSubCategories = Array.from(
    new Set(
      specialties
        .filter(item => {
          const filiereConf = Object.values(FILIERES).find(f => f.id.toLowerCase() === selectedFiliere.toLowerCase());
          return selectedFiliere === 'all' || 
            item.filiere.toLowerCase() === selectedFiliere.toLowerCase() ||
            (filiereConf && item.filiere.toLowerCase() === filiereConf.name.toLowerCase());
        })
        .map(item => item.subCategory)
    )
  );

  // Count specialties per filiere
  const getFiliereCount = (filiereKeyOrName: string) => {
    if (filiereKeyOrName === 'all') return specialties.length;
    return specialties.filter(item => {
      const matchName = item.filiere.toLowerCase() === filiereKeyOrName.toLowerCase();
      const conf = Object.values(FILIERES).find(f => f.id.toLowerCase() === filiereKeyOrName.toLowerCase());
      const matchId = conf && item.filiere.toLowerCase() === conf.name.toLowerCase();
      return matchName || matchId;
    }).length;
  };

  // Active specialty details helper
  const rawActiveSpecialty = specialties.find(s => s.id === activeSpecialtyId) || null;
  const activeSpecialty = rawActiveSpecialty ? enrichSpecialty(rawActiveSpecialty) : null;

  // Initialize editor with current specialty details
  const handleOpenDetailOrEdit = (specialty: SpecialtyItem, startInEditMode = false) => {
    setActiveSpecialtyId(specialty.id);
    setIsEditing(startInEditMode);
    setIsCreating(false);
    setActiveImageIndex(0);
    
    // Enrich with default values if they are missing
    const enriched = enrichSpecialty(specialty);

    // Set form fields
    setEditName(enriched.name);
    setEditDesc(enriched.description);
    setEditLongDesc(enriched.longDescription || '');
    setEditDuration(enriched.duration);
    setEditLevel(enriched.levelRequired);
    setEditImages([...enriched.images]);
    setNewImageUrl('');

    // Set enriched field states
    setEditModules((enriched.modules || []).join('\n'));
    setEditSkills((enriched.skills || []).join('\n'));
    setEditOpportunities((enriched.opportunities || []).join('\n'));
    setEditTuition(enriched.tuitionFee || '');
    setEditCertification(enriched.certification || '');
    setEditStudyRhythm(enriched.studyRhythm || '');
  };

  // Open creation panel for a new specialty
  const handleOpenCreate = () => {
    setIsCreating(true);
    setActiveSpecialtyId(null);
    setIsEditing(true);
    setActiveImageIndex(0);

    // Initialize fields with sensible defaults
    setEditName('');
    setEditDesc('');
    setEditLongDesc('');
    setEditDuration('12 Mois');
    setEditLevel('CAP / BEPC / BAC');
    setEditImages([
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=800",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"
    ]);
    setNewImageUrl('');

    setEditModules('');
    setEditSkills('');
    setEditOpportunities('');
    setEditTuition('180 000 FCFA (payable en 2 ou 3 tranches)');
    setEditCertification('DQP / CQP délivré par le MINEFOP');
    setEditStudyRhythm('Cours du Jour (8h30 - 13h30) / Cours du Soir (17h30 - 20h30)');
    
    setCreateFiliere("Bâtiment, Construction et Travaux");
    setCreateSubCategory('Bâtiment');
  };

  // Delete a specialty permanently
  const handleDeleteSpecialty = (id: string, name: string) => {
    if (window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement la spécialité "${name}" ? Cette action est définitive et supprimera toutes les données associées.`)) {
      const updated = specialties.filter(item => item.id !== id);
      saveToStorage(updated);
      showToast(`La spécialité "${name}" a été définitivement supprimée.`);
      if (activeSpecialtyId === id) {
        setActiveSpecialtyId(null);
        setIsEditing(false);
      }
    }
  };

  // Reset all specialties back to default factory settings
  const handleResetToDefaults = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les spécialités et images par défaut ? Vos personnalisations seront perdues.")) {
      saveToStorage(defaultSpecialties);
      showToast("Réinitialisation réussie de toutes les 35 spécialités !");
      setActiveSpecialtyId(null);
      setIsCreating(false);
      setIsEditing(false);
    }
  };

  // Save the customized specialty details
  const handleSaveSpecialty = () => {
    if (!editName.trim()) {
      alert("Le nom de la spécialité est obligatoire.");
      return;
    }
    if (editImages.length === 0) {
      alert("Veuillez conserver au moins 1 image de présentation.");
      return;
    }

    if (isCreating) {
      // Build a brand new specialty object
      const newSpecialty: SpecialtyItem = {
        id: `sp-${Date.now()}`,
        name: editName.trim(),
        filiere: createFiliere,
        subCategory: createSubCategory.trim() || 'Informatique',
        description: editDesc.trim() || "Aucune description fournie.",
        longDescription: editLongDesc.trim() || "Cette formation pratique intensive comprend un stage pratique obligatoire en entreprise à Douala pour acquérir une solide maîtrise terrain.",
        duration: editDuration.trim() || "12 Mois",
        levelRequired: editLevel.trim() || "CAP / BEPC / BAC",
        images: editImages,
        modules: editModules.split('\n').map(l => l.trim()).filter(Boolean),
        skills: editSkills.split('\n').map(l => l.trim()).filter(Boolean),
        opportunities: editOpportunities.split('\n').map(l => l.trim()).filter(Boolean),
        tuitionFee: editTuition.trim() || "250 000 FCFA (payable en 3 tranches)",
        certification: editCertification.trim() || "DQP (Diplôme de Qualification Professionnelle)",
        studyRhythm: editStudyRhythm.trim() || "Cours du Jour / Cours du Soir"
      };

      const updated = [newSpecialty, ...specialties];
      saveToStorage(updated);
      showToast(`La nouvelle spécialité "${editName}" a été créée avec succès !`);
      setIsCreating(false);
      setIsEditing(false);
    } else {
      if (!activeSpecialtyId) return;
      const updated = specialties.map(item => {
        if (item.id === activeSpecialtyId) {
          return {
            ...item,
            name: editName,
            description: editDesc,
            longDescription: editLongDesc,
            duration: editDuration,
            levelRequired: editLevel,
            images: editImages,
            modules: editModules.split('\n').map(l => l.trim()).filter(Boolean),
            skills: editSkills.split('\n').map(l => l.trim()).filter(Boolean),
            opportunities: editOpportunities.split('\n').map(l => l.trim()).filter(Boolean),
            tuitionFee: editTuition.trim(),
            certification: editCertification.trim(),
            studyRhythm: editStudyRhythm.trim()
          };
        }
        return item;
      });

      saveToStorage(updated);
      showToast(`La spécialité "${editName}" a été mise à jour avec succès !`);
      setIsEditing(false);
    }
  };

  // Add a new image URL to current list
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
      alert("Veuillez entrer une adresse URL valide (commençant par http:// ou https://)");
      return;
    }
    setEditImages([...editImages, newImageUrl.trim()]);
    setNewImageUrl('');
    showToast("Nouvelle image ajoutée !");
  };

  // Remove an image from current list
  const handleRemoveImage = (indexToRemove: number) => {
    if (editImages.length <= 1) {
      alert("Chaque spécialité doit avoir au moins une image.");
      return;
    }
    const filtered = editImages.filter((_, i) => i !== indexToRemove);
    setEditImages(filtered);
    if (activeImageIndex >= filtered.length) {
      setActiveImageIndex(filtered.length - 1);
    }
  };

  // Quick helper to add premium Unsplash presets based on filiere to let them easily satisfy "ajouter 4 image et plus"
  const handleAddPresetImage = (url: string) => {
    setEditImages([...editImages, url]);
    showToast("Image d'illustration ajoutée !");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3"
          >
            <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-full">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl border border-blue-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1 text-xs font-semibold rounded-full border border-blue-400/20">
              ⚡ Catalogue des Formations
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Nos 39 Spécialités &amp; 5 Grandes Filières
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Personnalisez les descriptions, détails clés et ajoutez 4 images ou plus pour chaque spécialité enseignée au CFP-ITMC de Douala.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <span className="text-xs text-slate-400 font-medium px-2 block">Rôle actif :</span>
            <div className="flex bg-slate-950 p-1 rounded-xl">
              <button 
                onClick={() => { setActiveRole('visitor'); setIsEditing(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeRole === 'visitor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Étudiant / Public
              </button>
              <button 
                onClick={() => { setActiveRole('teacher'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeRole === 'teacher' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Enseignant
              </button>
              <button 
                onClick={() => { setActiveRole('admin'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeRole === 'admin' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Lock className="w-3.5 h-3.5" />
                Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert banner if on management role */}
      {activeRole !== 'visitor' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-amber-300 text-sm">Mode d'édition personnalisé activé ({activeRole === 'admin' ? 'Super Admin' : 'Enseignant Désigné'})</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vous pouvez survoler n'importe quelle spécialité pour la personnaliser, éditer sa description et ajouter autant d'images que souhaité. Vos données sont sauvegardées en temps réel.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {activeRole === 'admin' && (
              <Button 
                onClick={handleOpenCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 px-4 h-10 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Créer une Spécialité / Filière
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetToDefaults}
              className="text-slate-700 hover:text-rose-600 border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-rose-50 text-xs rounded-xl flex items-center gap-1.5 h-10"
            >
              <Undo className="w-3.5 h-3.5" />
              Réinitialiser tout par défaut
            </Button>
          </div>
        </motion.div>
      )}

      {/* Grid of 5 Main Filières */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-blue-600" />
          Filtrer par Grande Filière ({specialties.length} Spécialités au total)
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card 
            id="filiere-all"
            onClick={() => { setSelectedFiliere('all'); setSelectedSubCategory('all'); }}
            className={`cursor-pointer transition-all border-2 rounded-2xl p-5 relative overflow-hidden ${selectedFiliere === 'all' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-300 dark:border-slate-900 bg-white dark:bg-slate-950 hover:shadow-xs'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎓</span>
              <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">{specialties.length}</Badge>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">Toutes les formations</h3>
            <p className="text-xs text-slate-500">Tous nos domaines d'expertise</p>
          </Card>

          {Object.entries(FILIERES).map(([key, filiere]) => {
            const isActive = selectedFiliere.toLowerCase() === filiere.id.toLowerCase();
            const count = getFiliereCount(filiere.id);
            return (
              <Card 
                key={filiere.id}
                id={`filiere-${filiere.id}`}
                onClick={() => { setSelectedFiliere(filiere.id); setSelectedSubCategory('all'); }}
                className={`cursor-pointer transition-all border-2 rounded-2xl p-5 relative overflow-hidden ${isActive ? `border-slate-800 dark:border-white ${filiere.bgColor} shadow-md scale-[1.02]` : 'border-slate-100 hover:border-slate-300 dark:border-slate-900 bg-white dark:bg-slate-950 hover:shadow-xs'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{filiere.icon}</span>
                  <Badge className={`font-bold bg-slate-900 text-white dark:bg-slate-800`}>{count}</Badge>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 min-h-[40px] mb-1">
                  {filiere.name}
                </h3>
                <p className="text-xs text-slate-500">CFP-ITMC Douala</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <Input 
            placeholder="Rechercher une spécialité (ex: dev, soudure, caissier)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white dark:bg-slate-900 rounded-xl text-sm border-slate-200 dark:border-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Subcategories pills */}
        <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto justify-start md:justify-end overflow-x-auto max-w-full py-1">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Sous-groupe :
          </span>
          <button
            onClick={() => setSelectedSubCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedSubCategory === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200/60 text-slate-700 hover:bg-slate-300/60 dark:bg-slate-900 dark:text-slate-300'}`}
          >
            Tous
          </button>
          {availableSubCategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubCategory(sub)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedSubCategory === sub ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200/60 text-slate-700 hover:bg-slate-300/60 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Summary / Counter of filtered results */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <p>Affichage de {filteredSpecialties.length} spécialité(s) sur les 39 disponibles</p>
        {(selectedFiliere !== 'all' || selectedSubCategory !== 'all' || searchQuery !== '') && (
          <button 
            onClick={() => { setSelectedFiliere('all'); setSelectedSubCategory('all'); setSearchQuery(''); }}
            className="text-blue-600 hover:underline font-semibold"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Specialties Grid */}
      {filteredSpecialties.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Aucun résultat trouvé</h3>
          <p className="text-xs text-slate-500">
            Essayez de modifier vos critères de recherche ou de changer de grande filière de formation.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setSelectedFiliere('all'); setSelectedSubCategory('all'); setSearchQuery(''); }}
            className="text-xs rounded-xl"
          >
            Réinitialiser
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialties.map((item) => {
            // Get proper filiere config for tags
            const filiereConfig = Object.values(FILIERES).find(f => f.name.toLowerCase() === item.filiere.toLowerCase()) || FILIERES.INFORMATIQUE;
            
            return (
              <motion.div
                key={item.id}
                layoutId={`specialty-card-${item.id}`}
                className="group relative"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 overflow-hidden rounded-2xl flex flex-col shadow-xs hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                  
                  {/* Card Header (Multiple Image preview) */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                    <img 
                      src={item.images[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
                      }}
                    />
                    
                    {/* Top overlay badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <Badge className="bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border-none text-[10px] font-bold">
                        {filiereConfig.icon} {item.filiere}
                      </Badge>
                      <Badge className="bg-blue-600/90 text-white border-none text-[10px] font-bold">
                        {item.subCategory}
                      </Badge>
                    </div>

                    {/* Image count bubble */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-blue-400" />
                      {item.images.length} Photos
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-900 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {item.duration}
                        </span>
                        <span className="flex items-center gap-1 text-right line-clamp-1 max-w-[150px]">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                          Niveau: {item.levelRequired}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-1.5 mt-1">
                        <Button 
                          onClick={() => handleOpenDetailOrEdit(item, false)}
                          variant="outline"
                          className="flex-1 text-xs font-bold rounded-xl h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Consulter
                        </Button>
                        
                        {activeRole !== 'visitor' && (
                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              onClick={() => handleOpenDetailOrEdit(item, true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-10 px-3.5 gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Personnaliser</span>
                            </Button>
                            
                            {activeRole === 'admin' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSpecialty(item.id, item.name);
                                }}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl h-10 w-10 p-0 flex items-center justify-center shrink-0"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Specialty View & Customize Panel Overlay (Custom Framer Motion Modal) */}
      <AnimatePresence>
        {(isCreating || (activeSpecialtyId && activeSpecialty)) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setActiveSpecialtyId(null); setIsCreating(false); }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-6xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-900 max-h-[92vh] flex flex-col z-10"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-900/50 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className="bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-extrabold text-[10px] px-3 py-1 uppercase tracking-wider">
                      {isCreating ? createFiliere : (activeSpecialty ? activeSpecialty.filiere : "")}
                    </Badge>
                    <Badge className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                      {isCreating ? createSubCategory : (activeSpecialty ? activeSpecialty.subCategory : "")}
                    </Badge>
                    {isEditing && (
                      <Badge className="bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-pulse">
                        ✍️ {isCreating ? "Création d'une Filière" : "Mode d'édition"}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isCreating ? "Nouvelle Spécialité / Filière" : (isEditing ? `Modifier : ${editName}` : activeSpecialty?.name)}
                  </h2>
                </div>
                
                <button 
                  onClick={() => { setActiveSpecialtyId(null); setIsCreating(false); setIsEditing(false); }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* 1. VIEW MODE */}
                {!isEditing && (
                  <>
                    {/* Intro Grid: Left Image Carousel & Right Key Bento Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                      
                      {/* Left: Beautiful Interactive Image Carousel */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="relative h-72 md:h-96 bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-800">
                          <img 
                            src={activeSpecialty.images[activeImageIndex] || activeSpecialty.images[0]} 
                            alt={activeSpecialty.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Carousel Navigation buttons */}
                          {activeSpecialty.images.length > 1 && (
                            <>
                              <button 
                                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? activeSpecialty.images.length - 1 : prev - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all cursor-pointer shadow-lg hover:scale-110"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setActiveImageIndex((prev) => (prev === activeSpecialty.images.length - 1 ? 0 : prev + 1))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all cursor-pointer shadow-lg hover:scale-110"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Image index badge overlay */}
                          <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex gap-1.5 items-center">
                            Image {activeImageIndex + 1} / {activeSpecialty.images.length}
                          </div>

                          {/* Dot indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-1.5 items-center">
                            {activeSpecialty.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeImageIndex ? 'bg-blue-400 w-5' : 'bg-white/40'}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Small Thumbnails strip */}
                        <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none">
                          {activeSpecialty.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${idx === activeImageIndex ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Key Info & Bento Grid */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1 bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100/30 dark:border-blue-900/30">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">Présentation Générale :</span>
                            <p className="text-sm md:text-base font-medium text-slate-850 dark:text-slate-200 leading-relaxed italic">
                              "{activeSpecialty.description}"
                            </p>
                          </div>

                          {/* Bento grid of Key Practical Details */}
                          <div className="grid grid-cols-2 gap-3">
                            
                            <div className="bg-slate-50/80 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5">
                              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Durée</span>
                                <p className="text-xs font-black text-slate-800 dark:text-white">{activeSpecialty.duration}</p>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5">
                              <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Niveau Requis</span>
                                <p className="text-xs font-black text-slate-800 dark:text-white line-clamp-2" title={activeSpecialty.levelRequired}>
                                  {activeSpecialty.levelRequired}
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5">
                              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Régime</span>
                                <p className="text-xs font-black text-slate-800 dark:text-white">{activeSpecialty.studyRhythm || "Jour & Soir"}</p>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5">
                              <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Lieu d'études</span>
                                <p className="text-xs font-black text-slate-800 dark:text-white">Douala Logpom</p>
                              </div>
                            </div>

                            {/* Full width inside grid for tuition fee & certification */}
                            <div className="col-span-2 bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 flex items-start gap-3">
                              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Frais d'études &amp; Inscription</span>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {activeSpecialty.tuitionFee || "Frais très compétitifs (facilités de paiement en tranches)"}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-start gap-3">
                              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Diplôme &amp; Certification</span>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {activeSpecialty.certification || "DQP (Diplôme de Qualification Professionnelle) délivré par le MINEFOP"}
                                </p>
                              </div>
                            </div>

                          </div>
                        </div>

                        {activeRole !== 'visitor' && (
                          <div className="pt-2">
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl h-14 gap-2.5 shadow-lg shadow-blue-500/10 cursor-pointer text-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                              Personnaliser cette Spécialité
                            </Button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Extended Details Grid: Skills, Careers, and Curriculum Modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4 border-t border-slate-100 dark:border-slate-900">
                      
                      {/* Left Block: Competences Clés & Debouchés */}
                      <div className="space-y-6">
                        <div className="bg-slate-50/60 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800 space-y-4">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                            <Check className="w-5 h-5 text-emerald-600" />
                            Compétences clés acquises :
                          </h4>
                          <ul className="space-y-2.5">
                            {activeSpecialty.skills?.map((skill, index) => (
                              <li key={index} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50/60 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800 space-y-4">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            Débouchés professionnels au Cameroun :
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {activeSpecialty.opportunities?.map((opp, index) => (
                              <span 
                                key={index}
                                className="bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                💼 {opp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Structured Curriculum Modules */}
                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                            Programme pédagogique de la formation :
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-2.5">
                            {activeSpecialty.modules?.map((module, index) => (
                              <div 
                                key={index}
                                className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800 flex gap-3.5 items-center hover:shadow-xs dark:hover:shadow-none transition-shadow"
                              >
                                <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
                                  M{index + 1}
                                </span>
                                <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                  {typeof module === 'string' ? module : ((module as any)?.name || (module as any)?.title || 'Module')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-850">
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                            * Ce programme est dispensé de manière hautement pratique (70% de pratique en atelier, 30% de cours de synthèse théorique) avec un stage professionnel obligatoire garanti de 2 à 3 mois.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Full Width Long Description / Editorial presentation */}
                    <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white rounded-3xl space-y-3 relative overflow-hidden shadow-xl border border-slate-800">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                      <h4 className="font-black text-sm md:text-base tracking-wide uppercase text-blue-400">
                        Immersion Professionnelle &amp; Projet de Fin d'Étude
                      </h4>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                        {activeSpecialty.longDescription || "Cette formation pratique intensive comprend un stage pratique obligatoire en entreprise à Douala pour acquérir une solide maîtrise terrain et faciliter l'embauche immédiate des étudiants."}
                      </p>
                    </div>
                  </>
                )}


                {/* 2. EDIT MODE */}
                {isEditing && (
                  <div className="space-y-6">
                    
                    {/* General Text Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Nom de la Spécialité :</label>
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="ex: Génie logiciel et développement d'applications"
                          className="rounded-xl border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Durée :</label>
                          <Input 
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            className="rounded-xl border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Niveau d'admission :</label>
                          <Input 
                            value={editLevel}
                            onChange={(e) => setEditLevel(e.target.value)}
                            className="rounded-xl border-slate-200 dark:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grande Filiere & Sous-groupe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Grande Filière :</label>
                        <ModernSelect
                          dropdownTitle="Grande Filière"
                          value={isCreating ? createFiliere : (specialties.find(s => s.id === activeSpecialtyId)?.filiere || "Technologies de l'information et du numérique")}
                          onChange={(e) => {
                            if (isCreating) {
                              setCreateFiliere(e.target.value);
                            } else {
                              const updatedFiliere = e.target.value;
                              const updatedSpecialties = specialties.map(s => {
                                if (s.id === activeSpecialtyId) {
                                  return { ...s, filiere: updatedFiliere };
                                }
                                return s;
                              });
                              setSpecialties(updatedSpecialties);
                            }
                          }}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-205 dark:border-slate-800 text-sm bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          <option value="Bâtiment, Construction et Travaux">🏗️ Bâtiment, Construction et Travaux</option>
                          <option value="Industrie, Mécanique et Énergie">⚙️ Industrie, Mécanique et Énergie</option>
                          <option value="Informatique, Digital et Communication">💻 Informatique, Digital et Communication</option>
                          <option value="Administration, Commerce et Gestion">💼 Administration, Commerce et Gestion</option>
                        </ModernSelect>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Sous-catégorie / Groupe :</label>
                        <Input 
                          value={isCreating ? createSubCategory : (specialties.find(s => s.id === activeSpecialtyId)?.subCategory || "")}
                          onChange={(e) => {
                            if (isCreating) {
                              setCreateSubCategory(e.target.value);
                            } else {
                              const updatedSub = e.target.value;
                              const updatedSpecialties = specialties.map(s => {
                                if (s.id === activeSpecialtyId) {
                                  return { ...s, subCategory: updatedSub };
                                }
                                return s;
                              });
                              setSpecialties(updatedSpecialties);
                            }
                          }}
                          placeholder="ex: Informatique, Électricité, Commerce..."
                          className="rounded-xl border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Brève Description (Affichée sur les cartes) :</label>
                        <textarea 
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={2}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-850 dark:text-slate-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Description Longue &amp; Projet de Fin d'Étude :</label>
                        <textarea 
                          value={editLongDesc}
                          onChange={(e) => setEditLongDesc(e.target.value)}
                          rows={4}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-850 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Advanced Enriched Fields */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Détails avancés de la spécialité (Scolarité, Certification, Compétences...)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Frais de scolarité :</label>
                          <Input 
                            value={editTuition}
                            onChange={(e) => setEditTuition(e.target.value)}
                            placeholder="ex: 295 000 FCFA (payable en 3 tranches)"
                            className="rounded-xl border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Diplôme &amp; Certification :</label>
                          <Input 
                            value={editCertification}
                            onChange={(e) => setEditCertification(e.target.value)}
                            placeholder="ex: DQP agréé par le MINEFOP"
                            className="rounded-xl border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Régime d'études :</label>
                          <Input 
                            value={editStudyRhythm}
                            onChange={(e) => setEditStudyRhythm(e.target.value)}
                            placeholder="ex: Cours du Jour &amp; Cours du Soir"
                            className="rounded-xl border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-950"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                            <span>Compétences clés (une par ligne) :</span>
                          </label>
                          <textarea 
                            value={editSkills}
                            onChange={(e) => setEditSkills(e.target.value)}
                            rows={5}
                            placeholder="Saisissez une compétence clé par ligne..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                            <span>Débouchés (un par ligne) :</span>
                          </label>
                          <textarea 
                            value={editOpportunities}
                            onChange={(e) => setEditOpportunities(e.target.value)}
                            rows={5}
                            placeholder="Saisissez un débouché professionnel par ligne..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                            <span>Modules du programme (un par ligne) :</span>
                          </label>
                          <textarea 
                            value={editModules}
                            onChange={(e) => setEditModules(e.target.value)}
                            rows={5}
                            placeholder="Saisissez un module de formation par ligne..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Manager Section */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                          Gestionnaire d'Images de la Spécialité ({editImages.length} images)
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ajoutez au moins 4 images d'illustrations professionnelles pour valoriser ce parcours.
                        </p>
                      </div>

                      {/* Display grid of current images */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {editImages.map((imgUrl, index) => (
                          <div 
                            key={index} 
                            className="relative group bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2"
                          >
                            <div className="relative h-24 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0">
                              <img 
                                src={imgUrl} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300';
                                }}
                              />
                              <span className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                #{index + 1}
                              </span>
                            </div>

                            {/* Input to modify individual url */}
                            <input 
                              type="text" 
                              value={imgUrl} 
                              onChange={(e) => {
                                const copy = [...editImages];
                                copy[index] = e.target.value;
                                setEditImages(copy);
                              }}
                              placeholder="Lien URL de l'image"
                              className="w-full text-[10px] p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden text-slate-800 dark:text-slate-200"
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-3 right-3 p-1.5 bg-red-600/95 hover:bg-red-700 text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Supprimer cette image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new image controls */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex gap-2">
                          <Input 
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Saisissez ou collez l'URL d'une nouvelle image (ex: https://images.unsplash.com/...)"
                            className="rounded-xl flex-1 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                          />
                          <Button 
                            type="button"
                            onClick={handleAddImage}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 rounded-xl px-4 text-xs gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter l'image
                          </Button>
                        </div>

                        {/* Presets suggestions */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 block">Suggestion d'images haute qualité Unsplash (cliquez pour ajouter) :</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage("https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=800")}
                              className="text-[10px] bg-slate-200/50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-850 p-1.5 rounded-lg border border-transparent transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              ⚙️ Chantier BTP
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800")}
                              className="text-[10px] bg-slate-200/50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-850 p-1.5 rounded-lg border border-transparent transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              💻 Code / Informatique
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage("https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800")}
                              className="text-[10px] bg-slate-200/50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-850 p-1.5 rounded-lg border border-transparent transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              ☀️ Panneaux Solaires
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage("https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=800")}
                              className="text-[10px] bg-slate-200/50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-850 p-1.5 rounded-lg border border-transparent transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              🚗 Garage Automobile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPresetImage("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800")}
                              className="text-[10px] bg-slate-200/50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-850 p-1.5 rounded-lg border border-transparent transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                              📊 Bureau &amp; Gestion
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-900 flex justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex gap-2">
                  {activeRole === 'admin' && !isCreating && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (activeSpecialtyId && activeSpecialty) {
                          handleDeleteSpecialty(activeSpecialtyId, activeSpecialty.name);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs h-10 gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer la Spécialité
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          if (isCreating) {
                            setIsCreating(false);
                            setActiveSpecialtyId(null);
                          }
                        }}
                        className="rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleSaveSpecialty}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs h-10 gap-1.5 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        {isCreating ? "Créer la Spécialité" : "Enregistrer les Personnalisations"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveSpecialtyId(null)}
                        className="rounded-xl text-xs h-10 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        Fermer
                      </Button>
                      {activeRole !== 'visitor' && (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs h-10 gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Modifier les Détails
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
