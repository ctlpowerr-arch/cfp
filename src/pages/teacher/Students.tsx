import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  X,
  Send,
  Loader2,
  MapPin,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import OfficialTranscriptModal from "@/components/OfficialTranscriptModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeacherStudents() {
  const { teacher } = useOutletContext<{ teacher: any }>();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTranscriptStudent, setSelectedTranscriptStudent] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [editFormData, setEditFormData] = useState({
    prog: 0,
    attendance: 0,
    lastGrade: "",
    status: ""
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        const teacherClassCodes = teacher.assignedClasses ? teacher.assignedClasses.map((c: any) => typeof c === 'string' ? c : c?.classCode || c?.code || '') : [];
        let myStudents = data;
        if (teacherClassCodes.length > 0) {
          myStudents = data.filter((s: any) => 
            teacherClassCodes.includes(s.classCode) || 
            teacherClassCodes.includes(s.promo) ||
            (s.classCode && teacherClassCodes.some((cc: string) => s.classCode.startsWith(cc)))
          );
          setStudents(myStudents.length > 0 ? myStudents : data.slice(0, 16));
        } else if (teacher.specialty) {
          myStudents = data.filter((s: any) => s.specialty === teacher.specialty);
          setStudents(myStudents.length > 0 ? myStudents : data.slice(0, 16));
        } else {
          setStudents(data.slice(0, 16));
        }
      }
    } catch (err) {
      toast.error("Erreur de chargement des étudiants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [teacher]);

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        toast.success("Informations de l'étudiant mises à jour");
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error("Échec de la mise à jour");
    }
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    setEditFormData({
      prog: student.prog,
      attendance: student.attendance,
      lastGrade: student.lastGrade,
      status: student.status
    });
    setIsEditOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (student.matricule && student.matricule.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPromo = selectedPromo ? student.promo === selectedPromo : true;
    return matchesSearch && matchesPromo;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Message envoyé aux ${filteredStudents.length} étudiants filtrés !`);
    setIsMessageOpen(false);
    setMessageText("");
  };

  const handleExport = () => {
    toast.success("Exportation de la liste des étudiants démarrée...");
  };

  const openStudentDetail = (student: any) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">Gérer mes Étudiants</h2>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Suivi individuel et performance globale</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="h-11 sm:h-12 px-4 sm:px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 justify-center w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2 shrink-0" /> Exporter Liste
          </Button>
          <Button 
            onClick={() => setIsMessageOpen(true)}
            className="h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 justify-center w-full sm:w-auto shrink-0 cursor-pointer"
          >
            Envoyer Message Groupé
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Étudiants", value: filteredStudents.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Moyenne Générale", value: "13.8/20", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Taux de Présence", value: "92%", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Cas à Risque", value: filteredStudents.filter(s => s.status === "À risque").length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white dark:bg-slate-900 p-6 rounded-[2rem]">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* List Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            placeholder="Rechercher un étudiant..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 ring-blue-500/10"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl w-full md:w-auto">
          <Button 
            onClick={() => setSelectedPromo(null)}
            variant={selectedPromo === null ? "default" : "ghost"}
            className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase"
          >
            Tous
          </Button>
          <Button 
            onClick={() => setSelectedPromo("G1")}
            variant={selectedPromo === "G1" ? "default" : "ghost"}
            className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase"
          >
            Groupe 1
          </Button>
          <Button 
            onClick={() => setSelectedPromo("G2")}
            variant={selectedPromo === "G2" ? "default" : "ghost"}
            className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase"
          >
            Groupe 2
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-50 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Étudiant</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Groupe</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Progression</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Présence</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Dernière Note</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</TableHead>
                <TableHead className="px-8 py-5 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, i) => (
                <TableRow key={student.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                        <AvatarFallback>{student.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{student.name}</p>
                          {student.matricule && (
                            <span className="font-mono text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                              {student.matricule}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase border-slate-200">
                      Promo {student.promo}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <div className="w-32">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-500">{student.prog}%</span>
                      </div>
                      <Progress value={student.prog} className="h-1.5 bg-slate-100" />
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{student.attendance}%</span>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                      {student.lastGrade}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <Badge className={cn(
                      "rounded-lg font-black text-[9px] uppercase border-none px-3 py-1",
                      student.status === "Excellent" ? "bg-emerald-100 text-emerald-600" :
                      student.status === "À risque" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedTranscriptStudent(student)}
                        className="rounded-xl h-9 px-3.5 font-black text-[10px] uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1.5"
                        title="Relevé de Notes"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Relevé
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => openEditDialog(student)}
                        className="rounded-xl h-9 px-3 font-black text-[10px] uppercase text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => openStudentDetail(student)}
                        className="rounded-xl h-9 px-3 font-black text-[10px] uppercase text-slate-700 hover:bg-slate-100"
                      >
                        Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun étudiant trouvé</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Message Groupé</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              À destination de {filteredStudents.length} étudiants
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Objet</label>
              <Input placeholder="Ex: Rappel - TP à rendre" className="h-12 rounded-xl bg-slate-50 border-none font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-sm min-h-[150px] outline-none focus:ring-2 ring-blue-500/20" 
                placeholder="Votre message..." 
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              <Send className="w-4 h-4 mr-2" /> Envoyer maintenant
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-2xl rounded-2xl sm:rounded-[2.5rem] border-none p-0 overflow-hidden bg-white dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
          <div className="bg-slate-900 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/10 shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent?.name}`} />
              </Avatar>
              <div>
                <Badge className="bg-blue-600 mb-2 font-black text-[9px] uppercase border-none">Promo {selectedStudent?.promo}</Badge>
                <h2 className="text-2xl sm:text-3xl font-black">{selectedStudent?.name}</h2>
                <p className="text-slate-400 font-bold text-xs sm:text-sm">{selectedStudent?.email}</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedStudent?.prog}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progression</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedStudent?.attendance}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assiduité</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-2xl font-black text-blue-600">{selectedStudent?.lastGrade.split('/')[0]}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dernière Note</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Biographie & Infos</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {selectedStudent?.bio}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Phone className="w-4 h-4" /> {selectedStudent?.phone}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Mail className="w-4 h-4" /> {selectedStudent?.email}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                Profil Complet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setIsDetailOpen(false); setIsMessageOpen(true); }}
                className="flex-1 h-12 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest"
              >
                Contacter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Student Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] border-none p-4 sm:p-6 md:p-8 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Mise à jour</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Actualiser les performances de {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Progression (%)</label>
                <Input 
                  type="number" 
                  value={editFormData.prog}
                  onChange={e => setEditFormData({...editFormData, prog: parseInt(e.target.value)})}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Présence (%)</label>
                <Input 
                  type="number" 
                  value={editFormData.attendance}
                  onChange={e => setEditFormData({...editFormData, attendance: parseInt(e.target.value)})}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dernière Note (ex: 15/20)</label>
              <Input 
                value={editFormData.lastGrade}
                onChange={e => setEditFormData({...editFormData, lastGrade: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Statut</label>
              <Select 
                value={editFormData.status} 
                onValueChange={v => setEditFormData({...editFormData, status: v})}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="En progrès">En progrès</SelectItem>
                  <SelectItem value="À risque">À risque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              Sauvegarder les modifications
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Transcript Modal for Teacher */}
      <OfficialTranscriptModal
        isOpen={!!selectedTranscriptStudent}
        onClose={() => setSelectedTranscriptStudent(null)}
        student={selectedTranscriptStudent}
        canManagePublish={true}
        onCompositionUpdated={fetchStudents}
      />
    </div>
  );
}
