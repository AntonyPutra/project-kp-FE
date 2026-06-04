import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Heart, Bell, LogOut, User, Shield, ChevronRight, Home, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

import UserHome from './UserHome';
import UserLetters from './UserLetters';
import UserSocialAid from './UserSocialAid';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/user/dashboard', color: '#6366f1' },
  { icon: FileText,        label: 'Layanan Surat',  path: '/user/letters',   color: '#06b6d4' },
  { icon: Heart,           label: 'Bantuan Sosial', path: '/user/aid',       color: '#10b981' },
  { icon: User,            label: 'Profil Saya',    path: '/user/profile',   color: '#8b5cf6' },
  { icon: HelpCircle,      label: 'Bantuan',        path: '/user/help',      color: '#f59e0b' },
];

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifCount] = useState(2);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout!');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, zIndex: 100,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-success)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            <Home size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>SICAMS</div>
            <div style={{ fontSize: '0.625rem', color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal Masyarakat</div>
          </div>
        </div>

        {/* User greeting */}
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.05)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#34d399' }}>
              {user?.avatar}
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.6875rem', color: '#34d399' }}>Masyarakat</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path !== '/user/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`nav-item ${active ? 'active' : ''}`} style={{ width: '100%', marginBottom: '0.25rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '8px', background: active ? item.color + '22' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={16} color={active ? item.color : 'currentColor'} />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)' }}>
        <header style={{ height: 'var(--header-height)', background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Portal Masyarakat</span>
            <ChevronRight size={14} color="var(--text-disabled)" style={{ margin: '0 0.375rem', display: 'inline' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {NAV_ITEMS.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }} onClick={() => toast('Tidak ada notifikasi baru', { icon: '🔔' })}>
              <Bell size={16} />
              {notifCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', fontSize: '0.625rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifCount}</span>}
            </button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="dashboard" element={<UserHome />} />
            <Route path="letters" element={<UserLetters />} />
            <Route path="aid" element={<UserSocialAid />} />
            <Route path="*" element={<UserHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
