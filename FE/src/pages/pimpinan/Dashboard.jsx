import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Shield, TrendingUp, TrendingDown, Users,
  CheckCircle, Clock, AlertTriangle, ChevronRight,
  Activity, Globe, Zap, Menu,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle' } },
    tooltip: { backgroundColor: '#1e293b', borderColor: 'rgba(148,163,184,0.12)', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 12, cornerRadius: 10 },
  },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } } },
    y: { grid: { color: 'rgba(148,163,184,0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } } },
  },
};

const KPI_DATA = [
  { label: 'Total Pengguna',      value: 1247, prev: 1180, icon: Users,    color: '#6366f1', unit: '' },
  { label: 'Surat Disetujui',     value: 820,  prev: 710,  icon: FileText, color: '#06b6d4', unit: '' },
  { label: 'Bantuan Tersalurkan', value: 380,  prev: 320,  icon: Heart,    color: '#10b981', unit: '' },
  { label: 'Aset Tersedia',       value: 280,  prev: 300,  icon: Package,  color: '#f59e0b', unit: '' },
  { label: 'Blockchain Blocks',   value: 1247, prev: 1100, icon: Link2,    color: '#a78bfa', unit: '' },
  { label: 'Tingkat Approval',    value: 91.8, prev: 87.5, icon: CheckCircle, color: '#34d399', unit: '%' },
];

const approvalData = {
  labels: MONTHS,
  datasets: [{
    label: 'Surat Disetujui', data: [60, 78, 65, 110, 85, 128],
    borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#6366f1',
  }, {
    label: 'Bantuan Tersalurkan', data: [45, 55, 48, 72, 60, 88],
    borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#10b981',
  }],
};

const distData = {
  labels: ['Disetujui', 'Menunggu', 'Ditolak', 'Tersalurkan'],
  datasets: [{ data: [45, 15, 8, 32], backgroundColor: ['#6366f1', '#f59e0b', '#ef4444', '#10b981'], borderWidth: 0, hoverOffset: 8 }],
};

const barOpts = { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { ...CHART_OPTS.plugins.legend, position: 'bottom' } } };
const doughOpts = { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 16 } }, tooltip: CHART_OPTS.plugins.tooltip } };

export default function PimpinanDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [counts, setCounts] = useState(KPI_DATA.map(() => 0));
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    KPI_DATA.forEach((kpi, idx) => {
      const steps = 60;
      const inc = kpi.value / steps;
      let cur = 0;
      const iv = setInterval(() => {
        cur = Math.min(cur + inc, kpi.value);
        setCounts(prev => { const next = [...prev]; next[idx] = cur; return next; });
        if (cur >= kpi.value) clearInterval(iv);
      }, 1200 / steps);
    });
  }, []);

  const handleLogout = () => { logout(); toast.success('Logout berhasil!'); navigate('/login'); };

  const NAV = [
    { key: 'overview',   label: 'Executive Overview', icon: BarChart2 },
    { key: 'letters',    label: 'Layanan Surat',       icon: FileText },
    { key: 'aid',        label: 'Bantuan Sosial',      icon: Heart },
    { key: 'blockchain', label: 'Blockchain Audit',    icon: Link2 },
    { key: 'reports',    label: 'Laporan',             icon: Download },
  ];

  const APPROVALS = [
    { id: 1, type: 'Surat Domisili',    user: 'Budi Santoso',  date: '2026-06-04', urgent: true  },
    { id: 2, type: 'Bantuan BLT 2026', user: 'Siti Rahayu',   date: '2026-06-03', urgent: false },
    { id: 3, type: 'Surat Usaha',       user: 'Ahmad Fauzi',   date: '2026-06-03', urgent: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99, backdropFilter:'blur(4px)' }}
        />
      )}
      {/* Sidebar — Premium Gold Theme */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1a2a 100%)',
        borderRight: '1px solid rgba(245,158,11,0.15)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>SICAMS</div>
            <div style={{ fontSize: '0.625rem', color: '#fbbf24', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Executive Portal</div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245,158,11,0.2)', border: '2px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: '#fbbf24' }}>
              {user?.avatar}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.6875rem', color: '#fbbf24', fontWeight: 600 }}>👑 Pimpinan / Kepala</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
              className={`nav-item ${activeNav === item.key ? 'active' : ''}`}
              style={{ width: '100%', marginBottom: '0.25rem', ...(activeNav === item.key ? { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' } : {}) }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '8px', background: activeNav === item.key ? 'rgba(245,158,11,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={16} color={activeNav === item.key ? '#fbbf24' : 'currentColor'} />
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(245,158,11,0.1)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Header */}
        <header className="header" style={{
          background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245,158,11,0.12)',
        }}>
          {/* Mobile menu */}
          <button
            className="btn-ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: window.innerWidth <= 1024 ? 'block' : 'none' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Executive Portal</span>
            <ChevronRight size={14} color="var(--text-disabled)" style={{ margin: '0 0.375rem', display: 'inline' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24' }}>
              {NAV.find(n => n.key === activeNav)?.label || 'Overview'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-full)' }}>
              <div className="status-dot online" />
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Sistem Normal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 'var(--radius-full)' }}>
              <Link2 size={12} color="#a78bfa" />
              <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>Blockchain Valid</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-content">
          {/* Page title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">Executive Dashboard</h1>
              <p className="page-subtitle">Overview kinerja sistem SICAMS — Rabu, 4 Juni 2026</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm">
                <Activity size={14} /> Real-time
              </button>
              <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }} onClick={() => window.print()}>
                <Download size={14} /> Unduh Laporan
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {KPI_DATA.map((kpi, i) => {
              const pct = ((kpi.value - kpi.prev) / kpi.prev * 100).toFixed(1);
              const isUp = kpi.value >= kpi.prev;
              return (
                <div key={i} className="stat-card" style={{ animation: `fadeIn 0.4s ${i * 60}ms ease both`, borderColor: kpi.color + '22' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: kpi.color + '15', border: `1px solid ${kpi.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <kpi.icon size={18} color={kpi.color} />
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.2rem 0.5rem',
                      background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.6875rem', fontWeight: 700,
                      color: isUp ? '#34d399' : '#f87171',
                    }}>
                      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(pct)}%
                    </div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.unit === '%' ? counts[i].toFixed(1) : Math.floor(counts[i]).toLocaleString('id-ID')}{kpi.unit}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>{kpi.label}</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: kpi.color, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', opacity: 0.6 }} />
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tren Kinerja 6 Bulan</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surat & Bantuan Sosial</p>
                </div>
                <div className="badge badge-warning" style={{ fontSize: '0.625rem' }}>Live Data</div>
              </div>
              <div style={{ height: 240 }}>
                <Line data={approvalData} options={CHART_OPTS} />
              </div>
            </div>

            <div className="card">
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Distribusi Layanan</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status seluruh pengajuan</p>
              </div>
              <div style={{ height: 200 }}>
                <Doughnut data={distData} options={doughOpts} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Pending Approvals */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <AlertTriangle size={16} color="#f59e0b" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Menunggu Persetujuan
                </h3>
                <span className="badge badge-warning">{APPROVALS.length} pending</span>
              </div>
              {APPROVALS.map(a => (
                <div key={a.id} style={{
                  padding: '0.875rem',
                  background: a.urgent ? 'rgba(239,68,68,0.05)' : 'var(--bg-muted)',
                  border: `1px solid ${a.urgent ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.625rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {a.urgent && <span style={{ fontSize: '0.625rem', color: '#f87171', fontWeight: 700, background: 'rgba(239,68,68,0.15)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)' }}>URGENT</span>}
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.type}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{a.user} · {a.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-success btn-sm" onClick={() => toast.success('Disetujui!')} style={{ fontSize: '0.75rem' }}>
                        <CheckCircle size={12} /> Setuju
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => toast.error('Ditolak.')} style={{ fontSize: '0.75rem' }}>
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Performance */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                <Zap size={16} color="#a78bfa" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Performa Sistem
              </h3>
              {[
                { label: 'Tingkat Penyelesaian Surat',   value: 91.8,  color: '#6366f1' },
                { label: 'Distribusi Bantuan',           value: 90.5,  color: '#10b981' },
                { label: 'Ketersediaan Aset',            value: 79.1,  color: '#f59e0b' },
                { label: 'Integritas Blockchain',        value: 100,   color: '#a78bfa' },
                { label: 'Uptime Sistem',                value: 99.7,  color: '#34d399' },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    <span>{m.label}</span>
                    <span style={{ fontWeight: 700, color: m.color }}>{m.value}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 'var(--radius-full)', transition: 'width 1s ease', boxShadow: `0 0 8px ${m.color}66` }} />
                  </div>
                </div>
              ))}

              {/* Blockchain mini */}
              <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Link2 size={14} color="#a78bfa" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a78bfa' }}>Blockchain Status</span>
                </div>
                {[
                  { k: 'Total Blocks', v: '1,247' },
                  { k: 'Last Block', v: '#1247 — 10:30 WIB' },
                  { k: 'Chain Valid', v: '✅ 100%' },
                ].map(item => (
                  <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.k}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
