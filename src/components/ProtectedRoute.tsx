import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Accès à votre espace...</p>
        </div>
      </div>
    );
  }

  // Non authentifié -> redirection login avec le rôle ciblé
  if (!isAuthenticated || !user) {
    const targetRole = allowedRoles?.includes('admin')
      ? 'admin'
      : allowedRoles?.includes('student')
      ? 'student'
      : allowedRoles?.includes('secretary')
      ? 'secretary'
      : 'teacher';
    return <Navigate to={`/login?role=${targetRole}`} state={{ from: location }} replace />;
  }

  // Redirection automatique transparente et adaptée selon le rôle de l'utilisateur
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    if (user.role === 'admin' || user.role === 'secretary') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

