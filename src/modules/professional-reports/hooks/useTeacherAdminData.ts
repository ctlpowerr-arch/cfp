import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface AdminTeacherProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  mainSpecialty: string;
  specialties: string[];
  promotions: string[];
  assignedClasses?: string[];
  studentsCount: number;
  degree?: string;
  modules: {
    id: string;
    name: string;
    progress?: number;
    lessons?: number;
  }[];
}

export interface AdminStudentRecord {
  id: string;
  name: string;
  matricule: string;
  specialtyName: string;
  classCode: string;
  assignedTeacherName?: string;
  assignedTeacherId?: string;
}

export function useTeacherAdminData() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [teacherProfile, setTeacherProfile] = useState<AdminTeacherProfile | null>(null);
  const [allTeachers, setAllTeachers] = useState<AdminTeacherProfile[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AdminStudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);

        // 1. Charger les enseignants réels depuis la base Admin
        const tRes = await fetch('/api/teachers');
        const teachers: AdminTeacherProfile[] = await tRes.json();

        if (isMounted && Array.isArray(teachers) && teachers.length > 0) {
          setAllTeachers(teachers);

          // Trouver l'enseignant connecté par email ou ID
          let found = teachers.find(
            (t) =>
              t.id === user?.id ||
              (t.email && user?.email && t.email.toLowerCase() === user.email.toLowerCase())
          );

          // Si non trouvé et rôle teacher, vérifier localStorage 'teacherData' ou prendre le premier
          if (!found) {
            const stored = localStorage.getItem('teacherData');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                found = teachers.find((t) => t.id === parsed.id || t.email === parsed.email);
              } catch (e) {
                /* ignore */
              }
            }
          }

          const activeTeacher = found || teachers[0];
          setTeacherProfile(activeTeacher);
        }

        // 2. Charger les étudiants réels depuis l'administration
        const sRes = await fetch('/api/students');
        if (sRes.ok) {
          const studentsData = await sRes.json();
          if (isMounted && Array.isArray(studentsData)) {
            const mappedStudents: AdminStudentRecord[] = studentsData.map((s: any) => ({
              id: s.id || s.matricule,
              name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Apprenant',
              matricule: s.matricule || s.id,
              specialtyName: s.specialty || s.specialtyName || 'Génie Logiciel',
              classCode: s.classCode || s.promotion || 'G1',
              assignedTeacherName: s.assignedTeacherName,
              assignedTeacherId: s.assignedTeacherId,
            }));
            setAssignedStudents(mappedStudents);
          }
        }
      } catch (err) {
        console.error('Erreur chargement données admin enseignant :', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Extraction propre des Filières / Spécialités réelles assignées par l'Admin
  const assignedSpecialties = (() => {
    if (!teacherProfile) return [];
    const set = new Set<string>();
    if (teacherProfile.mainSpecialty) set.add(teacherProfile.mainSpecialty);
    if (teacherProfile.department) set.add(teacherProfile.department);
    if (Array.isArray(teacherProfile.specialties)) {
      teacherProfile.specialties.forEach((s) => set.add(s));
    }
    return Array.from(set);
  })();

  // Extraction propre des Matières / Modules réels assignés par l'Admin
  const assignedModules = (() => {
    if (!teacherProfile || !Array.isArray(teacherProfile.modules)) return [];
    return teacherProfile.modules;
  })();

  // Extraction propre des Classes / Promotions réelles assignées par l'Admin
  const assignedClasses = (() => {
    if (!teacherProfile) return [];
    const classes = teacherProfile.promotions || teacherProfile.assignedClasses || [];
    return Array.isArray(classes) ? classes : [];
  })();

  // Filtrer les étudiants qui appartiennent aux classes / spécialités de cet enseignant
  const teacherStudents = (() => {
    if (!teacherProfile) return assignedStudents;
    return assignedStudents.filter((s) => {
      if (s.assignedTeacherId === teacherProfile.id) return true;
      if (
        s.assignedTeacherName &&
        s.assignedTeacherName.toLowerCase().includes(teacherProfile.name.toLowerCase())
      ) {
        return true;
      }
      if (assignedClasses.includes(s.classCode)) return true;
      if (assignedSpecialties.includes(s.specialtyName)) return true;
      return false;
    });
  })();

  return {
    isTeacher,
    teacherProfile,
    allTeachers,
    assignedSpecialties,
    assignedModules,
    assignedClasses,
    teacherStudents,
    isLoadingAdminData: isLoading,
  };
}
