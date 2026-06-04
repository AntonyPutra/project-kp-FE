import React, { useState } from 'react';
import { Heart, CheckCircle, XCircle, Clock, Plus, Search, Eye, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AID_STATUS = {
  open:        { label: 'Terbuka',      class: 'badge-success' },
  closed:      { label: 'Ditutup',      class: 'badge-muted' },
  distributed: { label: 'Tersalurkan', class: 'badge-cyan' },
};

const APP_STATUS = {
  pending:       { label: 'Menunggu',      class: 'badge-muted' },
  under_review:  { label: 'Ditinjau',      class: 'badge-warning' },
  verified:      { label: 'Terverifikasi', class: 'badge-info' },
  approved:      { label: 'Disetujui',     class: 'badge-success' },
  rejected:      { label: 'Ditolak',       class: 'badge-danger' },
  distributed:   { label: 'Tersalurkan',  class: 'badge-cyan' },
};

const PROGRAMS = [
  { id: 1, code: 'BANSOS-2026-001', name: 'BLT Dana Desa 2026',       type: 'tunai',   amount: 600000,  quota: 200, registered: 145, status: 'open',        period: 'Jun – Agt 2026' },
  { id: 2, code: 'BANSOS-2026-002', name: 'Bantuan Sembako Ramadan',   type: 'sembako', amount: null,    quota: 100, registered: 100, status: 'distributed', period: 'Mar – Mar 2026' },
  { id: 3, code: 'BANSOS-2026-003', name: 'Beasiswa Pendidikan 2026',  type: 'pendidikan',amount:1500000, quota: 50, registered: 30,  status: 'open',        period: 'Jan – Des 2026' },
];

const APPLICATIONS = [
  { id: 1, user: 'Budi Santoso',  aid: 'BLT Dana Desa 2026',      income: 1500000, dependents: 3, status: 'pending',      submitted: '2026-06-01' },
  { id: 2, user: 'Siti Rahayu',  aid: 'BLT Dana Desa 2026',       income: 900000,  dependents: 5, status: 'approved',     submitted: '2026-05-30' },
  { id: 3, user: 'Ahmad Fauzi',  aid: 'Beasiswa Pendidikan 2026', income: 2000000, dependents: 2, status: 'under_review',  submitted: '2026-05-28' },
  { id: 4, user: 'Dewi Lestari', aid: 'BLT Dana Desa 2026',       income: 1200000, dependents: 4, status: 'distributed',   submitted: '2026-05-25' },
  { id: 5, user: 'Rudi Hartono', aid: 'BLT Dana Desa 2026',       income: 1800000, dependents: 1, status: 'rejected',     submitted: '2026-05-20' },
];

function formatCurrency(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function SocialAid() {
  const [tab, setTab] = useState('programs');
  const [apps, setApps] = useState(APPLICATIONS);
  const [search, setSearch] = useState('');

  const filtered = apps.filter(a =>
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.aid.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id, newStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    const labels = { approved: 'disetujui', rejected: 'ditolak', distributed: 'tersalurkan' };
    toast.success(`Pengajuan berhasil ${labels[newStatus] || 'diperbarui'}.`);
  };

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">Bantuan Sosial</h1>
        <p className="page-subtitle">Kelola program dan distribusi bantuan sosial masyarakat</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Program', value: PROGRAMS.length, color: '#6366f1' },
          { label: 'Total Pendaftar', value: apps.length, color: '#06b6d4' },
          { label: 'Disetujui', value: apps.filter(a => a.status === 'approved' || a.status === 'distributed').length, color: '#10b981' },
          { label: 'Menunggu', value: apps.filter(a => a.status === 'pending' || a.status === 'under_review').length, color: '#f59e0b' },
          { label: 'Ditolak', value: apps.filter(a => a.status === 'rejected').length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[{ key: 'programs', label: 'Program Bantuan' }, { key: 'applications', label: 'Pendaftaran' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0.625rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.key ? 'var(--primary-400)' : 'var(--text-muted)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--primary-500)' : 'transparent'}`,
            transition: 'all 0.15s ease', marginBottom: '-1px',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'programs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {PROGRAMS.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <span className="code" style={{ fontSize: '0.6875rem' }}>{p.code}</span>
                <span className={`badge ${AID_STATUS[p.status].class}`}>{AID_STATUS[p.status].label}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nilai Bantuan</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Periode</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.period}</div>
                </div>
              </div>
              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  <span>Kuota Terisi</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.registered} / {p.quota}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(p.registered / p.quota) * 100}%`,
                    background: p.registered >= p.quota ? '#10b981' : '#6366f1',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'applications' && (
        <>
          <div className="card" style={{ padding: '1rem' }}>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input className="input" placeholder="Cari pendaftar atau program..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Pendaftar</th>
                  <th>Program</th>
                  <th>Penghasilan/bulan</th>
                  <th>Tanggungan</th>
                  <th>Status</th>
                  <th>Tgl Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} color="#818cf8" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.user}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{app.aid}</td>
                    <td style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{formatCurrency(app.income)}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{app.dependents} orang</td>
                    <td><span className={`badge ${APP_STATUS[app.status].class}`}>{APP_STATUS[app.status].label}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{app.submitted}</td>
                    <td>
                      {(app.status === 'pending' || app.status === 'verified') && (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(app.id, 'approved')}>
                            <CheckCircle size={12} /> Setuju
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app.id, 'rejected')}>
                            <XCircle size={12} /> Tolak
                          </button>
                        </div>
                      )}
                      {app.status === 'approved' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(app.id, 'distributed')}>
                          <Heart size={12} /> Salurkan
                        </button>
                      )}
                      {(app.status === 'distributed' || app.status === 'rejected') && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
