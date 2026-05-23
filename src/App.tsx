import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import TrackingPage from '@/pages/TrackingPage';
import LoginPage from '@/pages/LoginPage';
import CairoDashboard from '@/pages/CairoDashboard';
import NigeriaDashboard from '@/pages/NigeriaDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ('cairo_staff' | 'nigeria_staff' | 'admin')[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
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
          <RoleGuard allowedRoles={['nigeria_staff', 'admin']}>
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
