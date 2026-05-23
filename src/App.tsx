import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import TrackingPage from '@/pages/TrackingPage';
import LoginPage from '@/pages/LoginPage';
import CairoDashboard from '@/pages/CairoDashboard';
import NigeriaDashboard from '@/pages/NigeriaDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';
import type { UserRole } from '@/types';

function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectMap: Record<UserRole, string> = {
      cairo_staff: '/cairo',
      kano_staff: '/nigeria',
      abuja_staff: '/nigeria',
      admin: '/admin',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TrackingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/cairo/*"
        element={
          <RoleGuard allowedRoles={['cairo_staff', 'admin']}>
            <CairoDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/nigeria/*"
        element={
          <RoleGuard allowedRoles={['kano_staff', 'abuja_staff', 'admin']}>
            <NigeriaDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </DataProvider>
    </AuthProvider>
  );
}
