import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Package, FileText, Heart, TrendingUp, TrendingDown,
  Activity, CheckCircle, Clock, XCircle, Link2, Eye,
  ArrowUpRight, RefreshCw, Download, Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
);

// Mock data
const STATS = [
  {
    id: 'users',
    label: 'Total Pengguna',
    value: 1_247,
    change: +12.5,
    icon: Users,
    color: '#6366f1',
    colorClass: 'primary',
    sub: '45 baru bulan ini',
  },
  {
    id: 'assets',
    label: 'Total Aset',
    value: 354,
    change: +3.2,
    icon: Package,
    color: '#f59e0b',
    colorClass: 'warning',
    sub: '280 tersedia',
  },
  {
    id: 'letters',
    label: 'Pengajuan Surat',
    value: 893,
    change: +8.7,
    icon: FileText,
    color: '#06b6d4',
    colorClass: 'cyan',
    sub: '23 menunggu',
  },
  {
    id: 'aid',
    label: 'Bantuan Sosial',
    value: 420,
    change: -2.1,
    icon: Heart,
    color: '#10b981',
    colorClass: 'success',
    sub: '380 tersalurkan',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];

const lineData = {
  labels: MONTHS,
  datasets: [
    {
      label: 'Pengajuan Surat',
      data: [65, 88, 72, 120, 95, 140],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    },
    {
      label: 'Bantuan Sosial',
      data: [40, 55, 48, 70, 62, 85],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#10b981',
      pointRadius: 4,
    },
  ],
};

const barData = {
  labels: MONTHS,
  datasets: [
    {
      label: 'Aset Dipinjam',
      data: [12, 18, 15, 24, 20, 30],
      backgroundColor: 'rgba(245,158,11,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Aset Dikembalikan',
      data: [10, 16, 14, 22, 18, 28],
      backgroundColor: 'rgba(99,102,241,0.6)',
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const doughnutData = {
  labels: ['Domisili', 'Usaha', 'Keterangan', 'Lainnya'],
  datasets: [{
    data: [38, 25, 27, 10],
    backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: 'rgba(148,163,184,0.12)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(148,163,184,0.06)' },
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(148,163,184,0.06)' },
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
    },
  },
};

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: 'rgba(148,163,184,0.12)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 10,
    },
  },
};

const RECENT_ACTIVITIES = [
  { id: 1, type: 'letter',    user: 'Budi Santoso',     action: 'Mengajukan Surat Domisili',      time: '5 mnt', status: 'pending',  icon: FileText, color: '#06b6d4' },
  { id: 2, type: 'aid',       user: 'Siti Rahayu',      action: 'Mendaftar Bantuan BLT 2026',     time: '15 mnt', status: 'approved', icon: Heart,    color: '#10b981' },
  { id: 3, type: 'asset',     user: 'Ahmad Fauzi',      action: 'Mengembalikan Laptop Dell',       time: '30 mnt', status: 'returned', icon: Package,  color: '#f59e0b' },
  { id: 4, type: 'letter',    user: 'Dewi Lestari',     action: 'Surat Usaha Disetujui',          time: '1 jam',  status: 'approved', icon: FileText, color: '#10b981' },
  { id: 5, type: 'user',      user: 'Rudi Hartono',     action: 'Registrasi Pengguna Baru',       time: '2 jam',  status: 'info',     icon: Users,    color: '#6366f1' },
  { id: 6, type: 'blockchain',user: 'System',           action: 'Block #247 Ditambahkan ke Chain', time: '2 jam',  status: 'chain',    icon: Link2,    color: '#a78bfa' },
];

const STATUS_CONFIG = {
  pending:  { label: 'Menunggu', class: 'badge-warning' },
  approved: { label: 'Disetujui', class: 'badge-success' },
  returned: { label: 'Dikembalikan', class: 'badge-info' },
  info:     { label: 'Baru', class: 'badge-primary' },
  chain:    { label: 'Blockchain', class: 'badge-cyan' },
};

function StatCard({ stat, delay = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current = Math.min(current + increment, stat.value);
        setCount(Math.floor(current));
        if (current >= stat.value) clearInterval(interval);
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [stat.value, delay]);

  const isUp = stat.change > 0;

  return (
    <div className={`stat-card ${stat.colorClass}`} style={{ animation: `fadeIn 0.4s ${delay}ms ease both` }}>
      {/* Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: stat.color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${stat.color}33`,
        }}>
          <stat.icon size={20} color={stat.color} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.25rem 0.625rem',
          background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem', fontWeight: 700,
          color: isUp ? '#34d399' : '#f87171',
        }}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(stat.change)}%
        </div>
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
        {count.toLocaleString('id-ID')}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>{stat.label}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{stat.sub}</div>

      {/* Glow bottom line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: stat.color, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', opacity: 0.5 }} />
    </div>
  );
}

export default function AdminHome() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="page-subtitle">
            Overview sistem SICAMS — Rabu, 4 Juni 2026
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm">
            <Download size={14} />
            Export Laporan
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {STATS.map((s, i) => <StatCard key={s.id} stat={s} delay={i * 80} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Line Chart */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tren Aktivitas</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surat & Bantuan Sosial (6 bulan)</p>
            </div>
            <div className="badge badge-primary">Live</div>
          </div>
          <div style={{ height: 220 }}>
            <Line data={lineData} options={CHART_OPTIONS} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pergerakan Aset</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peminjaman vs Pengembalian</p>
          </div>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={CHART_OPTIONS} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Jenis Surat</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribusi per kategori</p>
          </div>
          <div style={{ height: 200 }}>
            <Doughnut data={doughnutData} options={DOUGHNUT_OPTIONS} />
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>893</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Surat Diproses</div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem' }}>
        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Aktivitas Terbaru</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log aktivitas real-time sistem</p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Eye size={14} />
              Lihat Semua
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {RECENT_ACTIVITIES.map((act, i) => (
              <div key={act.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.75rem',
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.15s ease',
                animation: `fadeIn 0.3s ${i * 60}ms ease both`,
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: act.color + '22',
                  border: `1px solid ${act.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <act.icon size={16} color={act.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {act.action}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.user}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
                  <span className={`badge ${STATUS_CONFIG[act.status].class}`}>{STATUS_CONFIG[act.status].label}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats + Blockchain Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* System Health */}
          <div className="card">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Status Sistem</h3>
            {[
              { label: 'Auth Service',       status: 'online',  latency: '45ms' },
              { label: 'Community Service',   status: 'online',  latency: '62ms' },
              { label: 'Asset Service',       status: 'online',  latency: '38ms' },
              { label: 'Blockchain Service',  status: 'online',  latency: '120ms' },
              { label: 'Notification Service',status: 'online',  latency: '89ms' },
              { label: 'Redis Cache',         status: 'online',  latency: '8ms' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className={`status-dot ${s.status}`} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.latency}</span>
              </div>
            ))}
          </div>

          {/* Blockchain Summary */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(99,102,241,0.05) 100%)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <Link2 size={16} color="#a78bfa" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#a78bfa' }}>Blockchain Status</h3>
            </div>
            {[
              { label: 'Total Blocks', value: '1,247', mono: true },
              { label: 'Last Block Hash', value: 'a8f3...c291', mono: true },
              { label: 'Chain Integrity', value: '✅ Valid', mono: false },
              { label: 'Blocks Today', value: '+18', mono: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  fontFamily: item.mono ? 'var(--font-mono)' : 'inherit',
                  fontWeight: 600,
                }}>
                  {item.value}
                </span>
              </div>
            ))}
            <button onClick={() => navigate('/admin/blockchain')} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', borderColor: 'rgba(167,139,250,0.3)', color: '#a78bfa' }}>
              <Link2 size={12} />
              Buka Block Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
