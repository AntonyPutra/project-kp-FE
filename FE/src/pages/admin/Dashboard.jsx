import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Package, Heart,
  Link2, Bell, BarChart2, Settings, LogOut,
  Shield, ChevronRight, Menu, X, Bot, Activity,
  Layers, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// Sub-pages
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import AssetManagement from './AssetManagement';
import BlockchainExplorer from './BlockchainExplorer';
import SocialAid from './SocialAid';
import LetterManagement from './LetterManagement';
import AIAssistant from './AIAssistant';
import ActivityLogs from './ActivityLogs';
import Analytics from './Analytics';
import Settings from './Settings';

const NAV_ITEMS = [
  {
    section: 'Menu Utama',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', color: '#6366f1' },
      { icon: Users, label: 'Manajemen Pengguna', path: '/admin/users', color: '#8b5cf6' },
      { icon: FileText, label: 'Layanan Surat', path: '/admin/letters', color: '#06b6d4' },
      { icon: Heart, label: 'Bantuan Sosial', path: '/admin/social-aid', color: '#10b981' },
      { icon: Package, label: 'Manajemen Aset', path: '/admin/assets', color: '#f59e0b' },
    ],
  },
  {
    section: 'Fitur Lanjutan',
    items: [
      { icon: Link2, label: 'Blockchain Explorer', path: '/admin/blockchain', color: '#ec4899' },
      { icon: Bot, label: 'AI Assistant', path: '/admin/ai', color: '#a78bfa' },
      { icon: Activity, label: 'Activity Logs', path: '/admin/activity', color: '#34d399' },
    ],
  },
  {
    section: 'Sistem',
    items: [
      { icon: BarChart2, label: 'Analytics', path: '/admin/analytics', color: '#fb923c' },
      { icon: Settings, label: 'Pengaturan', path: '/admin/settings', color: '#94a3b8' },
    ],
  },
];

const ROLE_LABELS = {
  'super-admin': { label: 'Super Admin', color: '#6366f1' },
  'admin':       { label: 'Admin', color: '#8b5cf6' },
  'petugas':     { label: 'Petugas', color: '#06b6d4' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Pengajuan surat baru', desc: 'Budi Santoso mengajukan Surat Domisili', time: '5 menit lalu', unread: true },
    { id: 2, title: 'Aset dikembalikan', desc: 'Laptop Dell Inspiron telah dikembalikan', time: '1 jam lalu', unread: true },
    { id: 3, title: 'Pendaftaran bantuan baru', desc: '3 pendaftar baru BLT Dana Desa 2026', time: '2 jam lalu', unread: false },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout. Sampai jumpa!');
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const currentLabel = NAV_ITEMS.flatMap(s => s.items).find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99, backdropFilter:'blur(4px)' }}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0,
        zIndex: 100,
        overflowY: 'auto',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--gradient-primary)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            flexShrink: 0,
          }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SICAMS</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <p className="sidebar-section-title">{section.section}</p>
              {section.items.map(item => {
                const active = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`nav-item ${active ? 'active' : ''}`}
                    style={{ width: '100%' }}
                  >
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: '8px',
                      background: active ? item.color + '22' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.15s ease',
                    }}>
                      <item.icon size={16} color={active ? item.color : 'currentColor'} />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '10px',
              background: (ROLE_LABELS[user?.role]?.color || '#6366f1') + '33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
              color: ROLE_LABELS[user?.role]?.color || '#6366f1',
              flexShrink: 0,
              border: `1px solid ${(ROLE_LABELS[user?.role]?.color || '#6366f1')}44`,
            }}>
              {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: ROLE_LABELS[user?.role]?.color || 'var(--text-muted)' }}>
                {ROLE_LABELS[user?.role]?.label || user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          height: 'var(--header-height)',
          background: 'rgba(10,15,30,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Mobile menu */}
          <button
            className="btn-ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Admin</span>
            <ChevronRight size={14} color="var(--text-disabled)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentLabel}</span>
          </div>

          {/* System status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div className="status-dot online" />
            Sistem Online
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNotif(!showNotif)}
              style={{ position: 'relative', padding: '0.5rem' }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--danger)',
                  fontSize: '0.625rem', fontWeight: 700, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                width: 340,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                animation: 'fadeIn 0.2s ease',
              }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notifikasi</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--border)',
                    background: n.unread ? 'rgba(99,102,241,0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(99,102,241,0.04)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                      {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{n.desc}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: (ROLE_LABELS[user?.role]?.color || '#6366f1') + '33',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            color: ROLE_LABELS[user?.role]?.color || '#6366f1',
            border: `1px solid ${(ROLE_LABELS[user?.role]?.color || '#6366f1')}44`,
            cursor: 'pointer',
          }}>
            {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="assets" element={<AssetManagement />} />
            <Route path="blockchain" element={<BlockchainExplorer />} />
            <Route path="social-aid" element={<SocialAid />} />
            <Route path="letters" element={<LetterManagement />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="activity" element={<ActivityLogs />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<AdminHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
