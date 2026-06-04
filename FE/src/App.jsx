import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import api from './lib/api';

// Pages
import LoginPage from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import PimpinanDashboard from './pages/pimpinan/Dashboard';
import PublicAsset from './pages/public/PublicAsset';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Role-based redirect
function RoleRedirect() {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  const roleMap = {
    'super_admin': '/admin/dashboard',
    'admin': '/admin/dashboard',
    'masyarakat': '/user/dashboard',
    'pimpinan': '/pimpinan/dashboard',
  };
  return <Navigate to={roleMap[user.role] || '/login'} replace />;
}

function App() {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // Check auth status on load
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          login(res.data.data, null); // token already in storage
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [login, logout, setLoading]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/public/asset/:code" element={<PublicAsset />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pimpinan/*"
          element={
            <ProtectedRoute allowedRoles={['pimpinan']}>
              <PimpinanDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
