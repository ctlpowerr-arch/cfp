import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  Eye,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Pencil,
  Trash2,
  Upload,
  Save,
  Plus,
  RefreshCw,
  AlertCircle,
  FileUp,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { defaultSpecialties } from '@/data/specialtiesData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import EmailJsSettingsCard from '@/components/EmailJsSettingsCard';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    timeSlot: '',
    status: 'En attente',
    guardianName: '',
    guardianPhone: ''
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (e) {
      console.error("Error fetching registrations", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const openDetailModal = (reg: any) => {
    setSelectedReg(reg);
    setEditFormData({
      name: reg.name || `${reg.firstName || ''} ${reg.lastName || ''}`.trim(),
      email: reg.email || '',
      phone: reg.phone || '',
      specialty: reg.specialty || 'Génie Logiciel',
      timeSlot: reg.timeSlot || 'Cours du Jour (08h00 - 14h00)',
      status: reg.status || 'En attente',
      guardianName: reg.guardian?.name || reg.guardianName || '',
      guardianPhone: reg.guardian?.phone || reg.guardianPhone || ''
    });
    setIsEditingInfo(false);
    setIsPreviewOpen(true);
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const q = searchQuery.toLowerCase();
      return (
        (reg.name || '').toLowerCase().includes(q) ||
        (reg.specialty || '').toLowerCase().includes(q) ||
        (reg.email || '').toLowerCase().includes(q) ||
        (reg.id || '').toLowerCase().includes(q)
      );
    });
  }, [registrations, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? { ...reg, status: newStatus } : reg
        ));
        if (selectedReg?.id === id) {
          setSelectedReg((prev: any) => ({ ...prev, status: newStatus }));
          setEditFormData((prev: any) => ({ ...prev, status: newStatus }));
        }
        
        if (newStatus === 'Validé') {
          toast.success("🎉 Candidature validée avec succès ! Le candidat est maintenant officiellement admis dans les effectifs et son compte est activé.");
        } else if (newStatus === 'Rejeté') {
          toast.warning("❌ Candidature rejetée. Le candidat est exclu des effectifs et ne dispose d'aucun accès au système.");
        } else {
          toast.info(`⏳ Statut du dossier mis à jour : ${newStatus}. Le candidat reste en attente et non comptabilisé dans les effectifs.`);
        }
      } else {
        toast.error("Échec de la modification du statut.");
      }
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Erreur réseau lors de la mise à jour du statut");
    }
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    try {
      setIsSaving(true);
      const payload = {
        ...editFormData,
        guardian: {
          name: editFormData.guardianName,
          phone: editFormData.guardianPhone
        }
      };

      const response = await fetch(`/api/registrations/${selectedReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedReg = { ...selectedReg, ...payload };
        setSelectedReg(updatedReg);
        setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? updatedReg : r));
        setIsEditingInfo(false);
        toast.success("Informations du dossier enregistrées avec succès !");
      } else {
        toast.error("Erreur lors de l'enregistrement des informations");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedReg) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Le fichier dépasse 8 Mo. Veuillez choisir un document plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateDocument(docKey, dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const updateDocument = async (docKey: string, dataUrl: string | null) => {
    if (!selectedReg) return;

    const currentDocs = { ...(selectedReg.documents || {}) };
    if (dataUrl) {
      currentDocs[docKey] = dataUrl;
    } else {
      delete currentDocs[docKey];
    }

    try {
      const response = await fetch(`/api/registrations/${selectedReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: currentDocs })
      });

      if (response.ok) {
        const updatedReg = { ...selectedReg, documents: currentDocs };
        setSelectedReg(updatedReg);
        setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? updatedReg : r));
        toast.success(dataUrl ? "Document ajouté / mis à jour avec succès !" : "Pièce supprimée du dossier numérique.");
      } else {
        toast.error("Échec de la mise à jour de la pièce");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    }
  };

  const handleDeleteDocument = async (docKey: string, docLabel: string) => {
    if (!confirm(`Supprimer la pièce "${docLabel}" de ce dossier ?`)) return;
    await updateDocument(docKey, null);
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce dossier d'inscription ? Cette action est irréversible.")) return;
    
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRegistrations(prev => prev.filter(reg => reg.id !== id));
        setIsPreviewOpen(false);
        toast.success("Dossier candidat supprimé avec succès.");
      } else {
        toast.error("Échec de la suppression");
      }
    } catch (error) {
      console.error("Error deleting registration", error);
      toast.error("Erreur réseau");
    }
  };

  const documentSlots = [
    { label: 'Diplôme Requis (Baccalauréat / Probatoire / GCE)', key: 'diploma', icon: GraduationCap },
    { label: 'Acte de Naissance', key: 'birthCertificate', icon: FileText },
    { label: 'CNI / Document d\'Identité', key: 'cni', icon: FileText },
    { label: 'Certificat Médical', key: 'medicalCertificate', icon: FileText },
    { label: 'Reçu de Versement / Frais de Dossier', key: 'tuitionReceipt', icon: FileText },
    { label: 'Photo d\'Identité 4x4', key: 'photo', icon: FileText }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inscriptions & Dossiers</h1>
          <p className="text-slate-500 mt-1">Consultez, modifiez, validez ou supprimez les pré-inscriptions et pièces justificatives des candidats.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => setIsEmailModalOpen(true)}
            className="gap-2 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 font-bold cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-600" />
            <span>Paramètres EmailJS</span>
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase">Total Candidatures</p>
                <h3 className="text-3xl font-extrabold text-blue-950 dark:text-blue-200 mt-2">{registrations.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-800/30 text-blue-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase">En Attente</p>
                <h3 className="text-3xl font-extrabold text-amber-950 dark:text-amber-200 mt-2">
                  {registrations.filter(r => r.status === 'En attente').length}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-800/30 text-amber-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase">Validées</p>
                <h3 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-200 mt-2">
                  {registrations.filter(r => r.status === 'Validé').length}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List */}
      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Rechercher par nom, email, spécialité ou référence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
            />
          </div>
        </div>

        {/* Grid List of Registrations */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => (
            <Card key={reg.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-md transition-shadow overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-slate-100 dark:border-slate-800">
                      <AvatarImage src={reg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(reg.name)}`} />
                      <AvatarFallback className="font-bold">{reg.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{reg.name}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{reg.specialty}</p>
                    </div>
                  </div>
                  <Badge 
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      reg.status === 'Validé' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                      reg.status === 'Rejeté' ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    )}
                  >
                    {reg.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{reg.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{reg.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{reg.timeSlot || 'Cours du Jour'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{reg.id}</span>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      onClick={() => openDetailModal(reg)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 rounded-xl h-8 px-3 font-bold text-xs flex gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ouvrir Fiche</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-44">
                        <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'Validé')} className="text-emerald-600 font-bold gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Valider
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'Rejeté')} className="text-red-600 font-bold gap-2">
                          <XCircle className="w-4 h-4" /> Rejeter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'En attente')} className="text-amber-600 font-bold gap-2">
                          <Clock className="w-4 h-4" /> Mettre en attente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteRegistration(reg.id)} className="text-red-600 font-bold gap-2">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-slate-300" />
              <p className="font-medium">Aucune demande trouvée.</p>
            </div>
          </div>
        )}
      </Card>

      {/* Complete Detail & Update Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl">
          {selectedReg && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                      <AvatarImage src={selectedReg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedReg.name)}`} />
                      <AvatarFallback className="font-bold text-lg">{selectedReg.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white leading-snug">
                        {selectedReg.name}
                      </DialogTitle>
                      <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono font-bold">{selectedReg.id}</Badge>
                        <span className="text-slate-500 font-medium text-xs">Postulant pour {selectedReg.specialty}</span>
                        <Badge 
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                            selectedReg.status === 'Validé' ? "bg-emerald-600 text-white" :
                            selectedReg.status === 'Rejeté' ? "bg-red-600 text-white" :
                            "bg-amber-500 text-white"
                          )}
                        >
                          {selectedReg.status}
                        </Badge>
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isEditingInfo ? "default" : "outline"}
                      onClick={() => setIsEditingInfo(!isEditingInfo)}
                      className="gap-1.5 h-10 px-4 rounded-xl font-bold text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{isEditingInfo ? "Fermer Édition" : "Modifier Informations"}</span>
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => deleteRegistration(selectedReg.id)}
                      className="gap-1.5 h-10 px-4 rounded-xl font-bold text-xs"
                      title="Supprimer définitivement ce dossier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Supprimer Dossier</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
                {/* Left Column: Personal Information (View / Edit Form) */}
                <div className="space-y-6">
                  {isEditingInfo ? (
                    <form onSubmit={handleSavePersonalInfo} className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" />
                          Modification des Informations
                        </h4>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Mode Édition</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nom Complet</Label>
                        <Input 
                          required
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="h-11 rounded-xl bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email</Label>
                          <Input 
                            type="email"
                            required
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="h-11 rounded-xl bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Téléphone</Label>
                          <Input 
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="h-11 rounded-xl bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Filière / Spécialité</Label>
                        <Select 
                          value={editFormData.specialty} 
                          onValueChange={(val) => setEditFormData({ ...editFormData, specialty: val })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900">
                            <SelectValue placeholder="Sélectionner une filière" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64 rounded-xl">
                            {defaultSpecialties.map(sp => (
                              <SelectItem key={sp.id} value={sp.name}>{sp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Horaire Souhaité</Label>
                          <Select 
                            value={editFormData.timeSlot} 
                            onValueChange={(val) => setEditFormData({ ...editFormData, timeSlot: val })}
                          >
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900">
                              <SelectValue placeholder="Horaire" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Cours du Jour (08h00 - 14h00)">Cours du Jour (08h00 - 14h00)</SelectItem>
                              <SelectItem value="Cours du Soir (17h00 - 21h30)">Cours du Soir (17h00 - 21h30)</SelectItem>
                              <SelectItem value="Cours du Samedi (08h00 - 17h00)">Cours du Samedi (08h00 - 17h00)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Statut du Dossier</Label>
                          <Select 
                            value={editFormData.status} 
                            onValueChange={(val) => setEditFormData({ ...editFormData, status: val })}
                          >
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="En attente">⏳ En attente</SelectItem>
                              <SelectItem value="Validé">✅ Validé</SelectItem>
                              <SelectItem value="Rejeté">❌ Rejeté</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nom du Parent / Tuteur</Label>
                          <Input 
                            value={editFormData.guardianName}
                            onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                            placeholder="Optionnel"
                            className="h-11 rounded-xl bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Téléphone Tuteur</Label>
                          <Input 
                            value={editFormData.guardianPhone}
                            onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                            placeholder="Optionnel"
                            className="h-11 rounded-xl bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsEditingInfo(false)}
                          className="flex-1 rounded-xl h-11 font-bold text-xs"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-md shadow-blue-500/20"
                        >
                          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>Enregistrer</span>
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Informations Personnelles</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsEditingInfo(true)}
                          className="text-blue-600 hover:text-blue-700 font-bold text-xs gap-1.5 h-8"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                          <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedReg.email}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Téléphone</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedReg.phone}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Horaire Souhaité</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedReg.timeSlot || 'Cours du Jour (08h00 - 14h00)'}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                          <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Filière / Spécialité</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedReg.specialty}</p>
                          </div>
                        </div>

                        {(selectedReg.guardian?.name || selectedReg.guardianName) && (
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Tuteur / Parent</p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {selectedReg.guardian?.name || selectedReg.guardianName} ({selectedReg.guardian?.phone || selectedReg.guardianPhone || 'N/A'})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase block">État administratif</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">Statut actuel du dossier</span>
                        </div>
                        <Badge 
                          className={cn(
                            "px-3 py-1 font-bold text-xs uppercase",
                            selectedReg.status === 'Validé' ? "bg-emerald-600 text-white" :
                            selectedReg.status === 'Rejeté' ? "bg-red-600 text-white" :
                            "bg-amber-500 text-white"
                          )}
                        >
                          {selectedReg.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Digital Dossier Documents Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Dossier Numérique (Documents)</h4>
                      <p className="text-[11px] text-slate-500">Ajoutez, mettez à jour ou supprimez les pièces jointes.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {documentSlots.map((doc) => {
                      const docData = selectedReg.documents?.[doc.key];
                      const hasDoc = Boolean(docData && docData.length > 0);

                      return (
                        <div 
                          key={doc.key} 
                          className="p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl hover:border-blue-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              hasDoc ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            )}>
                              <doc.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{doc.label}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {hasDoc ? (
                                  <Badge variant="outline" className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200">
                                    Document Fourni ✅
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200">
                                    Pièce Manquante ⚠️
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {/* Hidden file input for upload */}
                            <input 
                              type="file"
                              ref={(el) => { fileInputRefs.current[doc.key] = el; }}
                              onChange={(e) => handleFileUpload(doc.key, e)}
                              accept="image/*,application/pdf"
                              className="hidden"
                            />

                            {hasDoc && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (docData.startsWith('data:') || docData.startsWith('http')) {
                                    const win = window.open();
                                    if (win) {
                                      win.document.write(`<iframe src="${docData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                    }
                                  } else {
                                    window.open(docData, '_blank');
                                  }
                                }}
                                className="h-8 px-2.5 rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 font-bold text-xs gap-1"
                                title="Visualiser la pièce"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Voir</span>
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[doc.key]?.click()}
                              className="h-8 px-2.5 rounded-lg text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-bold text-xs gap-1"
                              title={hasDoc ? "Remplacer le document" : "Ajouter le document"}
                            >
                              <FileUp className="w-3.5 h-3.5 text-blue-600" />
                              <span>{hasDoc ? "Remplacer" : "Téléverser"}</span>
                            </Button>

                            {hasDoc && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDocument(doc.key, doc.label)}
                                className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Supprimer ce document du dossier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="rounded-xl h-11 px-6 font-bold"
                >
                  Fermer
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 rounded-xl h-11 px-5 font-bold"
                    onClick={() => handleStatusChange(selectedReg.id, 'Rejeté')}
                  >
                    Rejeter
                  </Button>
                  
                  <Button 
                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 rounded-xl h-11 px-5 font-bold"
                    onClick={() => handleStatusChange(selectedReg.id, 'En attente')}
                  >
                    Mettre en Attente
                  </Button>

                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 font-black uppercase text-xs tracking-wider flex gap-2 shadow-md shadow-emerald-600/20"
                    onClick={() => handleStatusChange(selectedReg.id, 'Validé')}
                  >
                    <UserCheck className="w-4 h-4" />
                    Valider le Dossier
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EmailJS Quick Configuration & Test Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              Configuration EmailJS &amp; Notifications d'Inscription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Gérez les clés de transmission automatique et testez la réception des e-mails en direct.
            </DialogDescription>
          </DialogHeader>

          <EmailJsSettingsCard />
        </DialogContent>
      </Dialog>
    </div>
  );
}
