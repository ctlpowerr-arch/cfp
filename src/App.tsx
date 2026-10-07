/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AcademicYearProvider } from "./context/AcademicYearContext";
import { AuthProvider } from "./context/AuthContext";
import { BrandingProvider } from "./context/BrandingContext";
import { RegistrationModalProvider } from "./context/RegistrationModalContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { lazyWithRetry } from "./utils/lazyRetry";

import { ErrorBoundary } from "./components/ErrorBoundary";
import RouteMetaTracker from "./components/RouteMetaTracker";

// Keep LandingPage statically imported so the initial screen renders instantly without a flash
import LandingPage from "./pages/LandingPage";

// Lazy load other public pages with auto-retry
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"));
const FormationsPage = lazyWithRetry(() => import("./pages/FormationsPage"));
const NewsPage = lazyWithRetry(() => import("./pages/NewsPage"));
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage"));

// Lazy load administrative pages and layouts with auto-retry
const DashboardLayout = lazyWithRetry(() => import("./layouts/DashboardLayout"));
const DashboardOverview = lazyWithRetry(() => import("./pages/dashboard/Overview"));
const NewsAdminPage = lazyWithRetry(() => import("./pages/dashboard/NewsAdmin"));
const StudentsPage = lazyWithRetry(() => import("./pages/dashboard/Students"));
const TeachersPage = lazyWithRetry(() => import("./pages/dashboard/Teachers"));
const CoursesPage = lazyWithRetry(() => import("./pages/dashboard/Courses"));
const LearningPage = lazyWithRetry(() => import("./pages/dashboard/Learning"));
const AdminSchedulePage = lazyWithRetry(() => import("./pages/dashboard/Schedule"));
const AdminClassesPage = lazyWithRetry(() => import("./pages/dashboard/Classes"));
const AIChatPage = lazyWithRetry(() => import("./pages/dashboard/AIChat"));
const RegistrationsPage = lazyWithRetry(() => import("./pages/dashboard/Registrations"));
const FinancePage = lazyWithRetry(() => import("./pages/dashboard/Finance"));
const AdminAttendancePage = lazyWithRetry(() => import("./pages/dashboard/Attendance"));
const InterventionReportsAdmin = lazyWithRetry(() => import("./pages/dashboard/InterventionReportsAdmin"));
const StaffManagementPage = lazyWithRetry(() => import("./pages/dashboard/StaffManagement"));
const AdminInternshipsPage = lazyWithRetry(() => import("./pages/dashboard/Internships"));
const AdminNotesBulletinsPage = lazyWithRetry(() => import("./pages/dashboard/NotesBulletins"));
const StaffPortalPage = lazyWithRetry(() => import("./pages/staff/StaffPortal"));

// Lazy load authentication
const TeacherLoginPage = lazyWithRetry(() => import("./pages/auth/TeacherLogin"));

// Lazy load teacher space
const TeacherLayout = lazyWithRetry(() => import("./layouts/TeacherLayout"));
const TeacherOverview = lazyWithRetry(() => import("./pages/teacher/Overview"));
const TeacherModules = lazyWithRetry(() => import("./pages/teacher/Modules"));
const TeacherCompositions = lazyWithRetry(() => import("./pages/teacher/Compositions"));
const TeacherStudents = lazyWithRetry(() => import("./pages/teacher/Students"));
const TeacherSchedule = lazyWithRetry(() => import("./pages/teacher/Schedule"));
const TeacherClassesPage = lazyWithRetry(() => import("./pages/teacher/Classes"));
const TeacherAttendancePage = lazyWithRetry(() => import("./pages/teacher/Attendance"));
const TeacherGamesPage = lazyWithRetry(() => import("./pages/teacher/Games"));
const TeacherInterventionReports = lazyWithRetry(() => import("./pages/teacher/InterventionReportsTeacher"));
const TeacherAI = lazyWithRetry(() => import("./pages/teacher/AI"));
const SettingsPage = lazyWithRetry(() => import("./pages/SettingsPage"));

// Lazy load student space
const StudentLayout = lazyWithRetry(() => import("./layouts/StudentLayout"));
const StudentOverview = lazyWithRetry(() => import("./pages/student/Overview"));
const StudentModules = lazyWithRetry(() => import("./pages/student/Modules"));
const StudentGamesPage = lazyWithRetry(() => import("./pages/student/Games"));
const StudentInterventionReports = lazyWithRetry(() => import("./pages/student/InterventionReportsStudent"));
const StudentSchedule = lazyWithRetry(() => import("./pages/student/Schedule"));
const StudentGrades = lazyWithRetry(() => import("./pages/student/Grades"));
const StudentInternshipPage = lazyWithRetry(() => import("./pages/student/Internship"));
const StudentSettings = lazyWithRetry(() => import("./pages/student/Settings"));

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] text-[#1c1917]">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
      <div className="absolute w-6 h-6 border-4 border-amber-600/10 border-b-amber-600 rounded-full animate-spin [animation-direction:reverse]"></div>
    </div>
    <p className="mt-4 text-sm font-medium tracking-wide text-stone-500 animate-pulse">
      Chargement de la plateforme...
    </p>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AcademicYearProvider>
            <BrandingProvider>
              <RegistrationModalProvider>
                <Router>
                  <RouteMetaTracker />
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                {/* --- SITE VITRINE PUBLIC (Libre d'accès & Isolé) --- */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/a-propos" element={<AboutPage />} />
                <Route path="/formations" element={<FormationsPage />} />
                <Route path="/actualites" element={<NewsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* --- PORTAILS D'AUTHENTIFICATION MULTI-RÔLES --- */}
                <Route path="/login" element={<TeacherLoginPage />} />
                <Route path="/login/admin" element={<TeacherLoginPage />} />
                <Route path="/login/teacher" element={<TeacherLoginPage />} />
                <Route path="/login/student" element={<TeacherLoginPage />} />
                <Route path="/login/secretary" element={<TeacherLoginPage />} />
                <Route path="/admin" element={<TeacherLoginPage />} />

                {/* --- ESPACES DE GESTION ITMC SÉCURISÉS (PROTÉGÉS PAR CHIFFREMENT & RBAC) --- */}
                {/* 1. Portail Administration */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'secretary']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardOverview />} />
                  <Route path="caisse" element={<FinancePage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="news" element={<NewsAdminPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="registrations" element={<RegistrationsPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="classes" element={<AdminClassesPage />} />
                  <Route path="schedule" element={<AdminSchedulePage />} />
                  <Route path="attendance" element={<AdminAttendancePage />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="reports" element={<InterventionReportsAdmin />} />
                  <Route path="rapports" element={<InterventionReportsAdmin />} />
                  <Route path="games" element={<TeacherGamesPage />} />
                  <Route path="jeux" element={<TeacherGamesPage />} />
                  <Route path="ai" element={<TeacherGamesPage />} />
                  <Route path="internships" element={<AdminInternshipsPage />} />
                  <Route path="stage" element={<AdminInternshipsPage />} />
                  <Route path="notes-bulletins" element={<AdminNotesBulletinsPage />} />
                  <Route path="bulletins" element={<AdminNotesBulletinsPage />} />
                  <Route path="staff" element={<StaffManagementPage />} />
                  <Route path="personnel" element={<StaffManagementPage />} />
                  <Route path="staff-portal" element={<StaffPortalPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* 1.5. Portail Collaborateurs Administratifs */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'secretary']}>
                      <StaffPortalPage />
                    </ProtectedRoute>
                  }
                />

                {/* 2. Portail Enseignants */}
                <Route
                  path="/teacher"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TeacherOverview />} />
                  <Route path="attendance" element={<TeacherAttendancePage />} />
                  <Route path="emargement" element={<TeacherAttendancePage />} />
                  <Route path="classes" element={<TeacherClassesPage />} />
                  <Route path="modules" element={<TeacherModules />} />
                  <Route path="compositions" element={<TeacherCompositions />} />
                  <Route path="reports" element={<TeacherInterventionReports />} />
                  <Route path="rapports" element={<TeacherInterventionReports />} />
                  <Route path="games" element={<TeacherGamesPage />} />
                  <Route path="jeux" element={<TeacherGamesPage />} />
                  <Route path="students" element={<TeacherStudents />} />
                  <Route path="schedule" element={<TeacherSchedule />} />
                  <Route path="ai" element={<TeacherGamesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* 3. Portail Étudiants */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentOverview />} />
                  <Route path="modules" element={<StudentModules />} />
                  <Route path="reports" element={<StudentInterventionReports />} />
                  <Route path="rapports" element={<StudentInterventionReports />} />
                  <Route path="games" element={<StudentGamesPage />} />
                  <Route path="jeux" element={<StudentGamesPage />} />
                  <Route path="schedule" element={<StudentSchedule />} />
                  <Route path="grades" element={<StudentGrades />} />
                  <Route path="internship" element={<StudentInternshipPage />} />
                  <Route path="stage" element={<StudentInternshipPage />} />
                  <Route path="settings" element={<StudentSettings />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </RegistrationModalProvider>
      </BrandingProvider>
      </AcademicYearProvider>
    </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}
