import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import PimpinanDashboard from './pages/pimpinan/Dashboard';

// Auth Context
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Mock auth state for demo
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Role-based redirect after login
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleMap = {
    'super-admin': '/admin/dashboard',
    'admin': '/admin/dashboard',
    'petugas': '/admin/dashboard',
    'masyarakat': '/user/dashboard',
    'pimpinan': '/pimpinan/dashboard',
  };
  return <Navigate to={roleMap[user.role] || '/login'} replace />;
}

function App() {
  return (
    <AuthProvider>
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
          <Route path="/" element={<RoleRedirect />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['super-admin', 'admin', 'petugas']}>
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
