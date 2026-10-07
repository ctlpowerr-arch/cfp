import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  Plus, 
  Trash2, 
  ArrowRight,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ModernSelect } from '@/components/ui/select';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileContent: string;
  uploadedBy: string;
}

interface Internship {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  academicYear: string;
  companyName: string;
  companyLogo: string;
  location: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: 'active' | 'completed' | 'canceled' | 'pending';
  documents: Document[];
  certificateGenerated: boolean;
  createdAt: string;
}

export default function StudentInternship() {
  const { student } = useOutletContext<{ student: any }>();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedModel, setSelectedModel] = useState<number>(1);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorPhone, setSupervisorPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(2);

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('rapport');

  const fetchInternship = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/internships`);
      if (res.ok) {
        const data = await res.json();
        // Since API handles filtering, grab first or null
        if (Array.isArray(data) && data.length > 0) {
          setInternship(data[0]);
          // Populate form for editing
          setCompanyName(data[0].companyName || '');
          setLocation(data[0].location || '');
          setSupervisorName(data[0].supervisorName || '');
          setSupervisorEmail(data[0].supervisorEmail || '');
          setSupervisorPhone(data[0].supervisorPhone || '');
          setStartDate(data[0].startDate || '');
          setDurationMonths(data[0].durationMonths || 2);
        } else {
          setInternship(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch internship", err);
      toast.error("Impossible de charger les données du stage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, [student]);

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !startDate) {
      toast.error("Veuillez renseigner au moins le nom de l'entreprise et la date de début.");
      return;
    }

    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentClass: student.classCode || student.promo || 'G1-GL',
          academicYear: student.academicYear || '2026-2027',
          companyName,
          location,
          supervisorName,
          supervisorEmail,
          supervisorPhone,
          startDate,
          durationMonths,
          status: 'active'
        })
      });

      if (res.ok) {
        toast.success("Votre stage a été enregistré avec succès !");
        setIsCreating(false);
        fetchInternship();
      } else {
        const err = await res.json();
        toast.error(err.error || "Une erreur s'est produite.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion avec le serveur.");
    }
  };

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;

    try {
      const res = await fetch(`/api/internships/${internship.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          location,
          supervisorName,
          supervisorEmail,
          supervisorPhone,
          startDate,
          durationMonths,
        })
      });

      if (res.ok) {
        toast.success("Les informations de votre stage ont été mises à jour.");
        setIsEditing(false);
        fetchInternship();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion.");
    }
  };

  const handleCloseStage = async () => {
    if (!internship) return;
    if (!window.confirm("Êtes-vous sûr de vouloir clôturer votre stage ? Cette action enregistrera votre date de fin actuelle.")) return;

    try {
      const res = await fetch(`/api/internships/${internship.id}/close`, {
        method: 'PUT'
      });

      if (res.ok) {
        toast.success("Félicitations ! Votre stage est désormais clôturé.");
        fetchInternship();
      } else {
        toast.error("Échec de la clôture du stage.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion.");
    }
  };

  const handleGenerateCertificate = async () => {
    if (!internship) return;
    try {
      const res = await fetch(`/api/internships/${internship.id}/generate-certificate`, {
        method: 'POST'
      });
      if (res.ok) {
        toast.success("Attestation générée avec succès !");
        setShowCertificate(true);
        fetchInternship();
      } else {
        toast.error("Échec de la génération de l'attestation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!internship || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier dépasse la limite autorisée de 5 Mo.");
      return;
    }

    setUploadingDoc(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch(`/api/internships/${internship.id}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: docName || file.name,
            type: docType,
            fileContent: base64String
          })
        });

        if (res.ok) {
          toast.success("Document téléversé avec succès !");
          setDocName('');
          fetchInternship();
        } else {
          toast.error("Impossible de téléverser le document.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'envoi.");
      } finally {
        setUploadingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const printCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate percentage of stage completed
  let percentComplete = 0;
  let remainingDays = 0;
  if (internship) {
    const start = new Date(internship.startDate);
    const end = internship.endDate ? new Date(internship.endDate) : new Date();
    const today = new Date();
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();

    percentComplete = totalDuration > 0 
      ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)))
      : 0;

    const diffTime = end.getTime() - today.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Suivi de mon Stage</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez vos affectations de stage, vos documents administratifs et téléchargez votre attestation officielle.
          </p>
        </div>
        {internship && !isEditing && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              className="text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Modifier les informations
            </Button>
            {internship.status === 'active' && (
              <Button 
                onClick={handleCloseStage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Clôturer mon Stage
              </Button>
            )}
          </div>
        )}
      </div>

      {/* NO INTERNSHIP DECLARED */}
      {!internship && !isCreating && (
        <Card className="border border-dashed border-slate-300 rounded-3xl bg-white p-8 md:p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Aucun stage déclaré</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm leading-relaxed">
            Vous n'avez pas encore configuré votre stage professionnel. Un stage de 2 mois par défaut est requis pour finaliser votre année de formation au CFP-ITMC.
          </p>
          <div className="mt-8">
            <Button 
              onClick={() => {
                setStartDate(new Date().toISOString().split('T')[0]);
                setIsCreating(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5"
            >
              Déclarer mon stage maintenant
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* FORM: CREATE OR EDIT INTERNSHIP */}
      {(isCreating || isEditing) && (
        <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <CardTitle className="text-lg font-bold text-slate-800">
              {isCreating ? "Déclarer un nouveau Stage" : "Modifier les détails du Stage"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={isCreating ? handleCreateStage : handleUpdateStage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Nom de l'Entreprise d'accueil *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Orange Cameroun, MTN, Camtel..." 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Localisation / Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Douala, Akwa - Rue de la Joie" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Nom du Tuteur / Responsable de stage *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="Ex: M. Jean Dupont" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Email du Responsable
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={supervisorEmail}
                      onChange={(e) => setSupervisorEmail(e.target.value)}
                      placeholder="Ex: tuteur@entreprise.cm" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Téléphone du Responsable
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={supervisorPhone}
                      onChange={(e) => setSupervisorPhone(e.target.value)}
                      placeholder="Ex: +237 6xx xx xx xx" 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Date de début *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Durée (mois)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6"
                >
                  Sauvegarder
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STAGE IN PROGRESS OVERVIEW DASHBOARD */}
      {internship && !isEditing && !showCertificate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Stage Information Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5 flex flex-row items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Détails de mon Affectation</h3>
                  <p className="text-slate-400 text-xs font-mono mt-0.5">ID: {internship.id}</p>
                </div>
                <Badge className={cn(
                  "font-mono uppercase text-[10px] tracking-wider px-2.5 py-1 rounded-full border",
                  internship.status === 'completed' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                  {internship.status === 'completed' ? 'Clôturé' : 'En Cours'}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Visual Header / Company details */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 text-slate-500 font-extrabold text-lg">
                    {companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{internship.companyName}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {internship.location || "Non spécifié"}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Du {new Date(internship.startDate).toLocaleDateString('fr-FR')} au {new Date(internship.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {internship.status === 'active' && (
                  <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600">Progression du stage ({internship.durationMonths} mois)</span>
                      <span className="font-bold text-slate-900">{percentComplete}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-900 h-2 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }} />
                    </div>
                    {remainingDays > 0 ? (
                      <p className="text-[11px] text-slate-500">Il reste environ {remainingDays} jours de stage.</p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium">La période de stage est arrivée à son terme.</p>
                    )}
                  </div>
                )}

                {/* Supervisor details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <h5 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Tuteur de Stage</h5>
                    <p className="text-sm font-bold text-slate-800">{internship.supervisorName}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      {internship.supervisorEmail && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {internship.supervisorEmail}
                        </p>
                      )}
                      {internship.supervisorPhone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {internship.supervisorPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <h5 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Éligibilité de l'Attestation</h5>
                    {internship.status === 'completed' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Prêt à générer
                        </p>
                        <Button 
                          onClick={handleGenerateCertificate}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 h-auto rounded-lg"
                        >
                          Afficher l'Attestation
                          <Sparkles className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-500">
                        <p className="text-xs">
                          Votre attestation de fin de stage pourra être générée dès que votre stage aura été clôturé.
                        </p>
                        <p className="text-[10px] text-slate-400 italic">
                          Action requise : Clôturer le stage lorsque votre période de stage s'achève.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* DOCUMENTS BLOCK */}
            <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                <h3 className="font-bold text-slate-800">Dossiers & Documents de Stage</h3>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* File Upload Form Section */}
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Téléverser un nouveau document</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input 
                        type="text" 
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Ex: Convention de stage signée" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                      />
                    </div>
                    <div>
                      <ModernSelect 
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="convention">📄 Convention de Stage</option>
                        <option value="rapport">📝 Rapport de Stage</option>
                        <option value="evaluation">🎖️ Fiche d'Évaluation Tuteur</option>
                        <option value="autre">📁 Autre Document administratif</option>
                      </ModernSelect>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500">Formats supportés: PDF, PNG, JPG (Max 5Mo)</p>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="stage-file-upload" 
                        disabled={uploadingDoc}
                        onChange={handleFileUpload}
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                      <label 
                        htmlFor="stage-file-upload"
                        className={cn(
                          "cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors",
                          uploadingDoc && "opacity-50 pointer-events-none"
                        )}
                      >
                        {uploadingDoc ? "Envoi en cours..." : "Sélectionner & Envoyer"}
                        <Upload className="w-3.5 h-3.5" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* List of current documents */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Documents archivés</h4>
                  
                  {(!internship.documents || internship.documents.length === 0) ? (
                    <div className="text-center py-6 border border-slate-100 rounded-2xl bg-white text-slate-400 text-xs">
                      Aucun document n'a été déposé pour le moment.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden">
                      {internship.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Type: {doc.type.toUpperCase()} · Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          
                          <a 
                            href={doc.fileContent} 
                            download={doc.name}
                            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Quick FAQ / Guide Info Column */}
          <div className="space-y-8">
            <Card className="border border-slate-200 rounded-3xl bg-slate-900 text-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32" />
              </div>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-white">Guide de Stage CFP-ITMC</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Chaque stagiaire doit effectuer un stage en entreprise d'une durée minimale de 2 mois pour l'année académique en cours.
                </p>
                <div className="space-y-3 pt-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>Déclarez votre entreprise d'accueil ainsi que votre date de début officielle.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Téléversez votre convention signée dès sa finalisation.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Faites évaluer votre rapport de stage par votre tuteur de stage.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <p>Clôturez votre stage sur le portail et téléchargez votre Attestation officielle.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Besoin d'aide ?</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  En cas de problème d'affectation ou de conflit avec votre tuteur de stage, veuillez contacter directement le secrétariat académique du CFP-ITMC.
                </p>
                <p className="text-slate-500 font-medium text-xs">
                  Tél / WhatsApp : <strong className="text-slate-900">+237 638 36 63 22 // +237 688 05 20 94</strong>
                </p>
                <p className="text-slate-400 font-mono text-[10px]">Email: secret-pedago@itmc-it.cm</p>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* GENERATED COMPLETION CERTIFICATE VIEW (PRINTABLE & MULTI-MODEL) */}
      {showCertificate && internship && (
        <div className="space-y-6">
          {/* Print stylesheet insertion */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: ${selectedModel % 2 === 0 ? 'landscape' : 'portrait'};
                margin: 0;
              }
              body * {
                visibility: hidden !important;
              }
              #print-area, #print-area * {
                visibility: visible !important;
              }
              .printable-certificate, .printable-certificate * {
                visibility: visible !important;
              }
              #print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }
              .printable-certificate {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                z-index: 9999999 !important;
                overflow: hidden !important;
              }
              .print-portrait {
                width: 210mm !important;
                height: 297mm !important;
              }
              .print-landscape {
                width: 297mm !important;
                height: 210mm !important;
              }
            }
          `}} />

          {/* Action Header with Selector */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCertificate(false)}
                className="text-slate-700 hover:bg-slate-100 h-9"
              >
                Retour
              </Button>
              <div className="h-4 w-[1px] bg-slate-300 hidden md:block" />
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    type="button"
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                      selectedModel === m
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    M{m} {m % 2 === 0 ? "Paysage" : "Portrait"}
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={printCertificate}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 h-9 rounded-xl font-bold px-4"
            >
              Imprimer (Sélection)
              <Printer className="w-4 h-4" />
            </Button>
          </div>

          {/* PRINT AREA CANVAS - DYNAMICALLY SHOWING SELECTED MODEL */}
          <div id="print-area" className="w-full bg-slate-100/50 p-4 md:p-8 rounded-3xl border border-slate-200 overflow-x-auto flex justify-center">
            
            {/* MODEL 1 : Classique Académique (Vertical / Portrait) */}
            {selectedModel === 1 && (
              <div 
                className="bg-white border-[24px] border-slate-950 p-6 md:p-14 w-[794px] max-w-full shadow-2xl relative font-serif text-slate-900 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Elegant corner ornaments */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/60 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/60 pointer-events-none" />

                {/* Subtle background watermarked logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none z-0">
                  <img
                    src="/watermark-logo.png"
                    alt=""
                    className="w-[340px] max-w-[70%] h-auto object-contain"
                  />
                </div>

                {/* Elegant Inner Double Border */}
                <div className="border border-double border-amber-600/40 p-6 md:p-10 h-full flex flex-col justify-between relative z-10" style={{ minHeight: '940px' }}>
                  
                  {/* Header section with Logo and School Info */}
                  <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                    <span className="text-[10px] tracking-widest uppercase font-sans text-amber-600 font-bold">RÉPUBLIQUE DU CAMEROUN</span>
                    <span className="text-[8px] tracking-wide text-stone-400 font-sans">PAIX - TRAVAIL - PATRIE</span>
                    <div className="w-16 h-[1px] bg-stone-200 my-1" />
                    <h2 className="text-2xl font-black tracking-widest uppercase font-serif text-slate-900">CFP - ITMC</h2>
                    <p className="text-[10px] max-w-lg tracking-wider uppercase font-sans text-slate-600 font-semibold leading-relaxed">
                      Centre de Formation Professionnelle aux Métiers des Technologies de l'Information et du Management au Cameroun
                    </p>
                    <p className="text-[9px] text-stone-400 font-sans italic">
                      Autorisation Ministérielle N° 000142/MINEFOP/SG/DFOP/SDGSF/SACD · Douala (Logpom)
                    </p>
                    <div className="w-32 h-[1px] bg-amber-600/40 my-3" />
                  </div>

                  {/* Title Block with Gold/Bronze accents */}
                  <div className="my-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-slate-950 font-serif leading-tight">
                      ATTESTATION DE FIN DE STAGE
                    </h1>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <div className="h-[1px] w-8 bg-amber-600/40" />
                      <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold font-sans">
                        Stage Professionnel de Fin de Cycle
                      </p>
                      <div className="h-[1px] w-8 bg-amber-600/40" />
                    </div>
                  </div>

                  {/* Certificate Body Paragraphs */}
                  <div className="my-8 max-w-2xl mx-auto space-y-5 text-sm md:text-base leading-relaxed text-slate-800 text-justify font-serif">
                    <p className="indent-8">
                      Le Directeur Académique du <strong>Centre de Formation Professionnelle (CFP-ITMC)</strong> certifie par la présente que l'apprenant(e) désigné(e) ci-après :
                    </p>
                    
                    <div className="text-center my-6">
                      <p className="text-xl md:text-2xl font-black text-amber-900 uppercase tracking-wide font-serif">
                        {student?.name || internship.studentName}
                      </p>
                      <p className="text-[11px] text-stone-500 font-sans mt-1">
                        Inscrit(e) en Spécialité : <strong className="text-slate-900 font-bold">{student?.specialty || internship.studentClass || "Génie Logiciel"}</strong> · Matricule : <strong className="text-slate-900 font-bold font-mono">{student?.matricule || internship.studentId}</strong>
                      </p>
                    </div>

                    <p className="indent-8">
                      A accompli avec assiduité, dévouement et esprit d'initiative un stage d'application pratique au sein de l'organisation :
                    </p>

                    <div className="text-center my-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-md mx-auto">
                      <p className="text-lg font-black text-slate-900 uppercase">{internship.companyName}</p>
                      <p className="text-[11px] text-stone-500 font-sans mt-0.5">{internship.location || "Douala, Cameroun"}</p>
                    </div>

                    <p className="indent-8">
                      Ce stage s'est déroulé durant la période allant du <strong>{new Date(internship.startDate).toLocaleDateString('fr-FR')}</strong> au <strong>{new Date(internship.endDate).toLocaleDateString('fr-FR')}</strong> (soit une durée réglementaire de {internship.durationMonths} mois), sous la direction technique de son tuteur professionnel en entreprise, <strong>M./Mme {internship.supervisorName}</strong>.
                    </p>

                    <p className="indent-8">
                      Durant son affectation, l'apprenant(e) a su faire montre de compétences techniques avérées, d'un comportement exemplaire et d'une rigueur professionnelle conforme aux standards académiques du CFP-ITMC.
                    </p>

                    <p>
                      En foi de quoi, la présente attestation officielle lui est délivrée pour servir et valoir ce que de droit.
                    </p>
                  </div>

                  {/* Seal and Signatures Area */}
                  <div className="grid grid-cols-3 gap-4 items-center mt-12 text-xs font-sans">
                    
                    {/* Left signature */}
                    <div className="text-center">
                      <p className="font-bold uppercase tracking-wider text-slate-800 text-[10px]">Le Maître de Stage</p>
                      <p className="text-[9px] text-stone-400 italic mt-0.5">{internship.companyName}</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="font-sans italic text-stone-300 text-[11px] font-black tracking-widest">[Signature validée]</span>
                      </div>
                      <p className="font-bold text-slate-900 text-[11px]">{internship.supervisorName}</p>
                    </div>

                    {/* Golden Center Stamp Badge */}
                    <div className="flex justify-center">
                      <div className="w-20 h-24 rounded-full border-4 border-amber-600/30 flex flex-col items-center justify-center p-2 relative bg-amber-500/[0.04] shadow-inner rotate-[-6deg]">
                        <div className="w-16 h-16 rounded-full border border-dashed border-amber-600/40 flex items-center justify-center flex-col">
                          <Sparkles className="w-6 h-6 text-amber-600/80 animate-pulse" />
                          <span className="text-[7px] font-black text-amber-700/80 tracking-widest mt-1">SÉCURISÉ</span>
                        </div>
                        <span className="text-[6px] font-bold text-amber-600/60 font-mono mt-1">ITMC CERTIFIED</span>
                      </div>
                    </div>

                    {/* Right signature */}
                    <div className="text-center">
                      <p className="font-bold uppercase tracking-wider text-slate-800 text-[10px]">Pour le CFP-ITMC</p>
                      <p className="text-[9px] text-stone-400 italic mt-0.5">Le Directeur Académique</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="font-sans italic text-amber-700/80 text-[11px] font-black tracking-widest">[Sceau Académique]</span>
                      </div>
                      <p className="font-bold text-slate-900 text-[11px]">Direction Pédagogique</p>
                    </div>

                  </div>

                  {/* Decorative Seal / Cert ID footer */}
                  <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center text-[9px] text-stone-400 font-sans tracking-wider">
                    <span>Réf Certificat: ITMC-STAGE-{internship.id.toUpperCase()}-{new Date(internship.startDate).getFullYear()}</span>
                    <span>Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 2 : Élite Moderne (Horizontal / Landscape) */}
            {selectedModel === 2 && (
              <div 
                className="bg-white border-[20px] border-slate-950 flex w-[1123px] max-w-full shadow-2xl relative font-sans text-slate-800 overflow-hidden text-left printable-certificate print-landscape"
                style={{ minHeight: '794px' }}
              >
                {/* Left golden band block */}
                <div className="w-[200px] bg-slate-950 p-8 flex flex-col justify-between items-center border-r border-amber-600/20 shrink-0 select-none">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-500 font-bold text-xs uppercase tracking-widest font-mono">CFP-ITMC</span>
                    <div className="w-8 h-[2px] bg-amber-500 my-2" />
                  </div>
                  
                  {/* Vertical turned elegant text */}
                  <div className="transform -rotate-90 text-[11px] tracking-[0.25em] uppercase text-stone-400 font-mono text-center font-bold whitespace-nowrap py-12">
                    🎓 CERTIFICAT DE STAGE PROFESSIONNEL
                  </div>

                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                </div>

                {/* Right content page (wide) */}
                <div className="flex-1 p-10 md:p-14 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                      <div>
                        <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900">CERTIFICAT D'ACCOMPLISSEMENT</h2>
                        <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-bold">CFP-ITMC Direction Académique Douala</p>
                      </div>
                      <Badge className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg uppercase tracking-wider font-mono text-[9px] px-2.5 py-1">
                        ITMC-EXCELLENCE
                      </Badge>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed text-justify text-slate-700 font-serif">
                      <p>
                        Le Directeur de l'établissement atteste officiellement que l'étudiant(e) mentionné(e) ci-dessous a validé l'intégralité des exigences pratiques requises pour l'obtention du diplôme professionnel de fin de cycle :
                      </p>
                      
                      <div className="py-4 my-2">
                        <p className="text-2xl font-sans font-black text-slate-900">{student?.name || internship.studentName}</p>
                        <p className="text-xs font-mono text-slate-500 mt-1 uppercase">
                          Spécialité : <strong className="text-slate-900">{student?.specialty || internship.studentClass}</strong> · Matricule : <strong className="text-slate-900 font-mono">{student?.matricule || internship.studentId}</strong>
                        </p>
                      </div>

                      <p>
                        A accompli avec distinction et professionnalisme ses fonctions de stagiaire auprès de la structure d'accueil <strong>{internship.companyName}</strong>, sise à <strong>{internship.location || "Douala"}</strong>, pour une période réglementaire de {internship.durationMonths} mois consécutifs, du {new Date(internship.startDate).toLocaleDateString('fr-FR')} au {new Date(internship.endDate).toLocaleDateString('fr-FR')}.
                      </p>

                      <p>
                        Pendant cette période d'immersion, l'intéressé(e) a fait preuve de rigueur technique et d'une aptitude remarquable à intégrer les équipes projets avec dynamisme.
                      </p>
                    </div>
                  </div>

                  {/* Landscape bottom signatures */}
                  <div className="grid grid-cols-2 gap-12 pt-8 border-t border-stone-100 text-xs">
                    <div>
                      <p className="font-mono text-slate-400 uppercase tracking-widest">Enseignant tuteur & Entreprise</p>
                      <p className="font-bold text-slate-800 mt-2">{internship.supervisorName} ({internship.companyName})</p>
                    </div>
                    <div>
                      <p className="font-mono text-slate-400 uppercase tracking-widest">Direction Générale CFP-ITMC</p>
                      <p className="font-bold text-slate-800 mt-2">Le Secrétariat Académique</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODEL 3 : Traditionnel Orné (Vertical / Portrait) */}
            {selectedModel === 3 && (
              <div 
                className="bg-[#fdfcf9] border-[16px] border-amber-800/20 p-8 md:p-14 w-[794px] max-w-full shadow-2xl relative font-serif text-slate-900 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Intricate border overlay */}
                <div className="absolute inset-4 border border-amber-600/30 pointer-events-none" />
                <div className="absolute inset-5 border-4 border-double border-amber-600/10 pointer-events-none" />

                <div className="h-full flex flex-col justify-between py-6 relative z-10" style={{ minHeight: '940px' }}>
                  
                  {/* Ornate Header */}
                  <div className="space-y-2">
                    <span className="text-amber-800 font-bold text-xs uppercase tracking-[0.2em]">Scolarité Traditionnelle</span>
                    <h2 className="text-2xl font-serif font-black italic tracking-wide text-slate-950">Centre de Formation Professionnelle ITMC</h2>
                    <p className="text-[10px] text-stone-500 tracking-wider">Agrément Officiel MINEFOP · Douala, Cameroun</p>
                    <div className="w-16 h-[2px] bg-amber-700/30 mx-auto mt-4" />
                  </div>

                  {/* Calligraphy Title */}
                  <div className="my-10">
                    <p className="text-stone-400 italic text-sm">Le présent document atteste solennellement de la</p>
                    <h1 className="text-4xl font-serif font-extrabold italic text-amber-900 tracking-wide mt-2">
                      Validation de Stage Professionnel
                    </h1>
                  </div>

                  {/* Parchment Body */}
                  <div className="max-w-xl mx-auto space-y-5 text-sm md:text-base leading-relaxed text-stone-800 italic">
                    <p>
                      Il est certifié devant l'institution académique que l'élève-apprenti :
                    </p>
                    
                    <p className="text-2xl font-bold font-serif not-italic text-slate-900 underline decoration-amber-600/50 underline-offset-8">
                      {student?.name || internship.studentName}
                    </p>

                    <p className="text-xs font-mono tracking-wider not-italic text-stone-500">
                      Spécialité : {student?.specialty || internship.studentClass} · Année {internship.academicYear}
                    </p>

                    <p>
                      A accompli avec honneur et assiduité son stage d'immersion professionnelle obligatoire auprès de la structure :
                    </p>

                    <p className="text-lg font-bold font-serif not-italic text-amber-900">
                      {internship.companyName}
                    </p>

                    <p>
                      Durant la période du {new Date(internship.startDate).toLocaleDateString('fr-FR')} au {new Date(internship.endDate).toLocaleDateString('fr-FR')} sous l'encadrement pédagogique de M./Mme {internship.supervisorName}.
                    </p>
                  </div>

                  {/* Vintage red/wax seal SVG */}
                  <div className="my-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center shadow-lg relative border-4 border-red-800 select-none">
                      <div className="w-10 h-10 rounded-full border border-dashed border-red-600 flex items-center justify-center text-white text-[8px] font-mono tracking-widest font-black">
                        ITMC
                      </div>
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                  </div>

                  {/* Calligraphy Signature lines */}
                  <div className="grid grid-cols-2 gap-8 text-xs font-sans not-italic text-stone-500 mt-8">
                    <div>
                      <p className="font-semibold uppercase text-slate-800">Le Secrétariat Académique</p>
                      <div className="h-12" />
                      <p className="italic font-serif">Douala, Cameroun</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase text-slate-800">Le Directeur Pédagogique</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">CFP-ITMC Administration</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 4 : Tech Minimaliste (Horizontal / Landscape) */}
            {selectedModel === 4 && (
              <div 
                className="bg-slate-950 border-4 border-slate-800 p-8 md:p-14 w-[1123px] max-w-full shadow-2xl relative font-mono text-slate-300 text-left overflow-hidden printable-certificate print-landscape"
                style={{ minHeight: '794px' }}
              >
                {/* Tech glowing background effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

                <div className="h-full flex flex-col justify-between" style={{ minHeight: '640px' }}>
                  
                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-widest">[ MODULE::INTERNSHIP_VALIDATION ]</h2>
                      <p className="text-[10px] text-slate-500 mt-1">CFP-ITMC ADVANCED PLATFORM // SYSTEME SECURISE</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>CERT_ID: {internship.id.toUpperCase()}</p>
                      <p>STATUS: VERIFIED_IMMUTABLE</p>
                    </div>
                  </div>

                  {/* Body Statement */}
                  <div className="my-10 space-y-6 text-sm">
                    <p className="text-slate-400">
                      &gt; L'étudiant(e) identifié(e) ci-après a validé avec succès le protocole académique de stage en entreprise :
                    </p>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <p className="text-lg font-black text-white">&gt; {student?.name || internship.studentName}</p>
                      <p className="text-xs text-slate-400">
                        &gt; CLASSE: {student?.classCode || internship.studentClass} // SPEC: {student?.specialty || "Génie Logiciel"}
                      </p>
                      <p className="text-xs text-slate-400">&gt; MATRICULE_ID: {student?.matricule || internship.studentId}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-400">
                        &gt; Entreprise d'accueil : <strong className="text-white">{internship.companyName}</strong> ({internship.location || "Cameroun"})
                      </p>
                      <p className="text-slate-400">
                        &gt; Durée : {internship.durationMonths} mois ({new Date(internship.startDate).toLocaleDateString()} &gt; {new Date(internship.endDate).toLocaleDateString()})
                      </p>
                      <p className="text-slate-400">
                        &gt; Superviseur principal : M./Mme {internship.supervisorName}
                      </p>
                    </div>
                  </div>

                  {/* Monospace block cryptographic verification hash */}
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-[10px] text-slate-500 flex justify-between items-center flex-wrap gap-2">
                    <span>DIGITAL_HASH_CHECK: 0x7fa890e1cb2a0149e9842bfcfc0211a19b88ef112a9e3bc89f1f0a82e8bf951a</span>
                    <span>ITMC VERIFIED SECURE GATEWAY</span>
                  </div>

                  {/* Minimal signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-500">// MAITRE DE STAGE SIGNATURE</p>
                      <p className="text-white mt-1">{internship.supervisorName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">// CFP-ITMC DIRECTION SIGNATURE</p>
                      <p className="text-white mt-1">Directeur Académique</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* MODEL 5 : Prestige Impérial (Vertical / Portrait) */}
            {selectedModel === 5 && (
              <div 
                className="bg-white border-2 border-stone-200 w-[794px] max-w-full shadow-2xl relative font-sans text-slate-800 text-center overflow-hidden printable-certificate print-portrait"
                style={{ minHeight: '1123px' }}
              >
                {/* Header blue banner solid block */}
                <div className="bg-indigo-950 text-white py-12 px-8 border-b-8 border-amber-500 relative">
                  <span className="text-[10px] tracking-widest uppercase text-amber-500 font-extrabold">CFP-ITMC ACADEMY</span>
                  <h1 className="text-3xl font-black uppercase mt-2 tracking-wider">PRESTIGE IMPÉRIAL</h1>
                  <p className="text-xs text-stone-300 mt-1 uppercase tracking-widest">Attestation d'Excellence Académique et Technique</p>
                </div>

                <div className="p-8 md:p-14 flex flex-col justify-between" style={{ minHeight: '750px' }}>
                  
                  {/* Imperial Seal icon representation */}
                  <div className="my-4 flex justify-center">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>

                  {/* Content statement */}
                  <div className="space-y-6 max-w-xl mx-auto text-sm leading-relaxed text-stone-700 font-serif text-justify">
                    <p className="text-center font-sans uppercase font-bold text-slate-500 text-xs tracking-wider">Le Conseil Pédagogique Déclare :</p>
                    
                    <p className="indent-8">
                      Ayant satisfait pleinement à l'ensemble du cursus de formation professionnelle et technique du CFP-ITMC, l'étudiant(e) émérite désigné(e) ci-après a validé with brio ses travaux de recherche appliquée et son stage professionnel :
                    </p>

                    <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto">
                      <p className="text-2xl font-sans font-black text-slate-900 uppercase">{student?.name || internship.studentName}</p>
                      <p className="text-xs text-stone-500 mt-1 font-sans">
                        Filière : {student?.specialty || internship.studentClass}
                      </p>
                    </div>

                    <p className="indent-8">
                      A réalisé ses travaux de stage en entreprise avec discipline, créativité et esprit de corps au sein de l'organisation <strong>{internship.companyName}</strong> (Douala), sous la tutelle de <strong>M./Mme {internship.supervisorName}</strong>.
                    </p>
                  </div>

                  {/* Imperial signatures footer */}
                  <div className="grid grid-cols-2 gap-12 border-t border-stone-100 pt-8 text-xs font-sans text-stone-500">
                    <div>
                      <p className="font-bold text-slate-800">LA DIRECTION DU STAGE</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">{internship.supervisorName}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">LE DIRECTEUR ACADÉMIQUE</p>
                      <div className="h-12" />
                      <p className="font-bold text-slate-900">CFP-ITMC Administration</p>
                    </div>
                  </div>

                  {/* Cert ID */}
                  <div className="pt-8 text-[9px] text-stone-400 font-mono flex justify-between items-center border-t border-stone-100 mt-6">
                    <span>VERIFICATION_KEY: {internship.id.toUpperCase()}</span>
                    <span>Douala, le {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
